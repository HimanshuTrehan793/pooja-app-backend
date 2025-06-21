import dotenv from "dotenv";
import { Client } from "@googlemaps/google-maps-services-js";
import { Request, Response } from "express"; // Import Response from express
import { parseQueryParams } from "../utils/parseQueryParams";
import {
  CreateAddressInput,
  getLocationQuerySchema,
  getSearchLocationQuerySchema,
  LocationQueryParams,
  SearchLocationQueryParams,
} from "../validations/address.validation";
import { sendResponse } from "../utils/sendResponse";
import axios from "axios";
import { ApiError } from "../utils/apiError";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { UserAddress } from "../models/userAddress.model";
import { where } from "sequelize";
import { db } from "../models";
// Configure dotenv
dotenv.config();

const googleMapsClient = new Client({});

// Define interface for return type
interface GeocodeResult {
  success: boolean;
  address?: string;
  components?: any[];
  error?: string;
}
interface ExtendedPrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  lat?: number;
  lng?: number;
}
interface AutocompleteResult {
  success: boolean;
  predictions?: any[];
  error?: string;
}

const reverseGeocodeService = async (
  lat: number,
  lng: number
): Promise<GeocodeResult> => {
  try {
    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      return {
        success: true,
        address: response.data.results[0].formatted_address,
        components: response.data.results[0].address_components,
      };
    }

    return {
      success: false,
      error: "No address found for these coordinates",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Unknown error occurred",
    };
  }
};

// Reverse Geocoding Function with arrow syntax
export const getAddressFromCoordinates = async (
  req: Request,
  res: Response
) => {
  const { lat, lng } = parseQueryParams(
    getLocationQuerySchema,
    req.query
  ) as LocationQueryParams;

  const result = await reverseGeocodeService(
    parseFloat(lat.toString()),
    parseFloat(lng.toString())
  );

  if (result.success) {
    sendResponse({
      res,
      message: "Address fetched successfully",
      data: result,
    });
  } else {
    return;
  }
};

export const getLatandLngFromAddress = async (req: Request, res: Response) => {
  const address = req.query.address as string;

  if (!address) {
    throw new ApiError(
      "Address not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

  const response = await axios.get(geocodeUrl, {
    params: {
      address,
      key: apiKey,
    },
  });

  const results = response.data.results;
  if (!results || results.length === 0) {
    throw new ApiError(
      "No results found for this address",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const location = results[0].geometry.location;

  sendResponse({
    res,
    message: "Address fetched successfully",
    data: {
      formatted_address: results[0].formatted_address,
      lat: location.lat,
      lng: location.lng,
    },
  });
};

export const getPlaceAutocomplete = async (
  input: string,
  options?: {
    language?: string;
  }
): Promise<AutocompleteResult> => {
  try {
    // Step 1: Get predictions
    const autocompleteResponse = await googleMapsClient.placeAutocomplete({
      params: {
        input,
        key: process.env.GOOGLE_MAPS_API_KEY!,
        components: ["country:in"],
        language: options?.language || "en",
      },
    });

    if (autocompleteResponse.data.status !== "OK") {
      return {
        success: false,
        error: autocompleteResponse.data.status,
      };
    }

    const predictions = autocompleteResponse.data.predictions;

    // Step 2: Enrich each prediction with lat/lng using placeDetails
    const enrichedPredictions: ExtendedPrediction[] = await Promise.all(
      predictions.map(async (prediction) => {
        try {
          const placeDetails = await googleMapsClient.placeDetails({
            params: {
              place_id: prediction.place_id,
              key: process.env.GOOGLE_MAPS_API_KEY!,
              fields: ["geometry"],
            },
          });

          const location = placeDetails.data.result.geometry?.location;

          return {
            ...prediction,
            lat: location?.lat,
            lng: location?.lng,
          };
        } catch (err) {
          console.warn(
            `Error fetching details for place_id ${prediction.place_id}`
          );
          return { ...prediction }; // fallback without lat/lng
        }
      })
    );

    return {
      success: true,
      predictions: enrichedPredictions,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Unknown error occurred",
    };
  }
};

export const getSuggestedResults = async (req: Request, res: Response) => {
  const { search } = parseQueryParams(
    getSearchLocationQuerySchema,
    req.query
  ) as SearchLocationQueryParams;

  const result = await getPlaceAutocomplete(search);

  if (result.success) {
    sendResponse({
      res,
      message: "Address fetched successfully",
      data: result,
    });
  } else {
    return;
  }
};

export const getUserAddresses = async (req: Request, res: Response) => {
  const result = db.UserAddress.findAndCountAll({
    where: {
      user_id: "1234",
    },
  });
  if (result) {
    sendResponse({
      res,
      message: "Address fetched successfully",
      data: result,
    });
  } else {
    return;
  }
};

export const addUserAddress = async (req: Request, res: Response) => {
  const data = req.body as CreateAddressInput;

  const result = db.UserAddress.create(data);

  if (result) {
    sendResponse({
      res,
      message: "Address fetched successfully",
      data: result,
    });
  } else {
    throw new ApiError(
      "Address not added",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }
};
