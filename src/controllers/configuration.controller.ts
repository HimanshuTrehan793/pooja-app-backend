import { Response, Request } from "express";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";
import { ConfigurationInput } from "../validations/configuration.validation";

const DEFAULT_CONFIG = {
  phone_number: "",
  whatsapp_number: "",
  store_status: true,
  min_order_amount: 0,
  delivery_charge: 0,
  delivery_time: 1,
  delivery_radius: 50,
  announcement_text: "",
  ad_banners: [],
};

export async function getConfigurations(req: Request, res: Response) {
  let configuration = await db.Configuration.findByPk(1);

  //   If not present, create with default
  if (!configuration) {
    configuration = await db.Configuration.create({ id: 1, ...DEFAULT_CONFIG });
  }
  configuration = await db.Configuration.findByPk(1, {
    include: [{ model: db.AdBanner, as: "ad_banners" }],
  });

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.OK,
    message: "Configuration fetched successfully",
    data: configuration,
  });
}

export async function updateConfiguration(req: Request, res: Response) {
  const updates = req.body;

  // Find or create config
  let configuration = await db.Configuration.findByPk(1);
  if (!configuration) {
    configuration = await db.Configuration.create({ id: 1, ...DEFAULT_CONFIG });
  }

  // 1. Update config fields (excluding ad_banners)
  const { ad_banners, ...configUpdates } = updates;
  await configuration.update(configUpdates);

  // 2. Sync ad_banners if provided
  if (Array.isArray(ad_banners)) {
    // Fetch existing banners
    const existing = await db.AdBanner.findAll({
      where: { configuration_id: 1 },
    });
    const existingMap = new Map(existing.map((b) => [b.id, b]));

    const incomingIds = ad_banners.filter((b) => b.id).map((b) => b.id);

    // a. Delete banners not present in incoming array
    for (const banner of existing) {
      if (!incomingIds.includes(banner.id)) {
        await banner.destroy();
      }
    }

    // b. Upsert banners
    for (const banner of ad_banners) {
      if (banner.id && existingMap.has(banner.id)) {
        // Update existing
        await db.AdBanner.update(
          { image: banner.image, action: banner.action },
          { where: { id: banner.id } }
        );
      } else {
        // Create new
        await db.AdBanner.create({
          image: banner.image,
          action: banner.action,
          configuration_id: 1,
        });
      }
    }
  }

  // 3. Return updated config (with banners)
  const fullConfig = await db.Configuration.findByPk(1, {
    include: [{ model: db.AdBanner, as: "ad_banners" }],
  });

  sendResponse({
    res,
    statusCode: 200,
    message: "Configuration updated successfully",
    data: fullConfig,
  });
}
