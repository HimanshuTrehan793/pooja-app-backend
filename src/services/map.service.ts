import { Client } from "@googlemaps/google-maps-services-js";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

const googleClient = new Client({});

export const searchPlacesByText = async (query: string) => {
  try {
    const response = await googleClient.textSearch({
      params: {
        query,
        key: getEnvVar("GOOGLE_MAPS_API_KEY"),
      },
    });
    return response.data.results;
  } catch (e) {
    throw new ApiError(
      "Failed to fetch places",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Google Maps API Error"
    );
  }
};

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await googleClient.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: getEnvVar("GOOGLE_MAPS_API_KEY"),
      },
    });

    return response.data.results[0] || null;
  } catch (e) {
    throw new ApiError(
      "Failed to reverse geocode",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Google Maps API Error"
    );
  }
}
