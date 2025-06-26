import { Request, Response } from "express";
import { reverseGeocode, searchPlacesByText } from "../services/map.service";
import { sendResponse } from "../utils/sendResponse";
import { parseQueryParams } from "../utils/parseQueryParams";
import {
  getLocationFromCoordinatesSchema,
  getMapSearchResultsSchema,
  LocationFromCoordinatesQueryParams,
} from "../validations/map.validation";

export const getMapSearchResults = async (req: Request, res: Response) => {
  const { q } = parseQueryParams(getMapSearchResultsSchema, req.query);
  const results = await searchPlacesByText(q);

  sendResponse({
    res,
    message: "Map search results fetched successfully",
    data: results,
  });

  return;
};

export const getAddressFromLatLng = async (req: Request, res: Response) => {
  const { lat, lng } = parseQueryParams(
    getLocationFromCoordinatesSchema,
    req.query
  ) as LocationFromCoordinatesQueryParams;

  const result = await reverseGeocode(lat, lng);

  if (!result) {
    sendResponse({
      res,
      message: "No address found for the provided coordinates",
      data: null,
    });
    
    return;
  }

  sendResponse({
    res,
    message: "Address fetched successfully",
    data: result,
  });

  return;
};
