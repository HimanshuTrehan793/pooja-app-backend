import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";

/**
 * Revenue definition (per product spec):
 *   revenue = SUM(order_items.price * order_items.quantity)
 *   Excludes: delivery charges, coupon discounts.
 *   Excludes orders in: cancelled, rejected, refunded, returned.
 *
 * Orders Received (graph + KPI) = COUNT of all orders placed in range,
 *   regardless of status — represents intake volume.
 */
const REVENUE_EXCLUDED_STATUSES = [
  "cancelled",
  "rejected",
  "refunded",
  "returned",
];

const parseRange = (req: Request) => {
  const from = new Date(req.query.from as string);
  const to = new Date(req.query.to as string);
  // Make `to` inclusive of the whole day if caller passed a date-only string.
  if ((req.query.to as string).length <= 10) {
    to.setHours(23, 59, 59, 999);
  }
  return { from, to };
};

/**
 * GET /api/analytics/sales-summary?from=ISO&to=ISO
 * Returns KPI totals + per-day series for orders + revenue.
 */
export const getSalesSummary = async (req: Request, res: Response) => {
  const { from, to } = parseRange(req);

  const rows = (await db.sequelize.query(
    `
    WITH order_totals AS (
      SELECT
        od.id,
        od.created_at,
        od.status,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS items_total
      FROM order_details od
      LEFT JOIN order_items oi ON oi.order_id = od.id
      WHERE od.created_at BETWEEN :from AND :to
      GROUP BY od.id, od.created_at, od.status
    )
    SELECT
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS orders,
      COALESCE(SUM(
        CASE WHEN status NOT IN (:excluded) THEN items_total ELSE 0 END
      ), 0)::float AS revenue
    FROM order_totals
    GROUP BY date_trunc('day', created_at)
    ORDER BY date_trunc('day', created_at) ASC;
    `,
    {
      replacements: { from, to, excluded: REVENUE_EXCLUDED_STATUSES },
      type: QueryTypes.SELECT,
    }
  )) as { date: string; orders: number; revenue: number }[];

  const totalOrders = rows.reduce((acc, r) => acc + r.orders, 0);
  const totalRevenue = rows.reduce((acc, r) => acc + Number(r.revenue), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.OK,
    message: "Sales summary fetched successfully",
    data: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      series: rows.map((r) => ({
        date: r.date,
        orders: r.orders,
        revenue: Math.round(Number(r.revenue) * 100) / 100,
      })),
    },
  });
};

/**
 * GET /api/analytics/top-customers?from=ISO&to=ISO&limit=50
 * Returns top customers by spend in the date range.
 */
export const getTopCustomers = async (req: Request, res: Response) => {
  const { from, to } = parseRange(req);
  const limit = Math.min(
    500,
    Math.max(1, Number(req.query.limit) || 50)
  );

  const rows = (await db.sequelize.query(
    `
    WITH order_totals AS (
      SELECT
        od.id,
        od.user_id,
        od.status,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS items_total
      FROM order_details od
      LEFT JOIN order_items oi ON oi.order_id = od.id
      WHERE od.created_at BETWEEN :from AND :to
      GROUP BY od.id, od.user_id, od.status
    )
    SELECT
      u.id AS user_id,
      u.first_name,
      u.last_name,
      u.phone_number,
      u.email,
      COUNT(ot.id)::int AS order_count,
      COALESCE(SUM(
        CASE WHEN ot.status NOT IN (:excluded) THEN ot.items_total ELSE 0 END
      ), 0)::float AS total_spent
    FROM order_totals ot
    JOIN users u ON u.id = ot.user_id
    GROUP BY u.id, u.first_name, u.last_name, u.phone_number, u.email
    ORDER BY total_spent DESC NULLS LAST, order_count DESC
    LIMIT :limit;
    `,
    {
      replacements: { from, to, excluded: REVENUE_EXCLUDED_STATUSES, limit },
      type: QueryTypes.SELECT,
    }
  )) as {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string;
    email: string | null;
    order_count: number;
    total_spent: number;
  }[];

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.OK,
    message: "Top customers fetched successfully",
    data: rows.map((r) => ({
      ...r,
      total_spent: Math.round(Number(r.total_spent) * 100) / 100,
    })),
  });
};
