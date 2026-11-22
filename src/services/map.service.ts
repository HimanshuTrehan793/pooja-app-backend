import { Client } from "@googlemaps/google-maps-services-js";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

const googleClient = new Client({});

/**
 * Pulls the useful bits out of a failed Google Maps call. The SDK rejects with
 * an Axios error, so the actual reason (REQUEST_DENIED, OVER_QUERY_LIMIT,
 * billing disabled, key restrictions) only lives on `e.response.data`.
 */
const describeGoogleMapsError = (e: unknown) => {
  const data = (e as { response?: { data?: unknown } })?.response?.data as
    | { status?: string; error_message?: string }
    | undefined;

  return {
    status: data?.status,
    errorMessage: data?.error_message,
    message: e instanceof Error ? e.message : String(e),
  };
};

const logGoogleMapsError = (operation: string, e: unknown) => {
  const { status, errorMessage, message } = describeGoogleMapsError(e);

  console.error(
    `[GoogleMaps] ${operation} failed ` +
      `status=${status ?? "unknown"} ` +
      `error_message=${errorMessage ?? "none"} ` +
      `cause=${message}`
  );
};

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
    logGoogleMapsError("textSearch", e);

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
    logGoogleMapsError("reverseGeocode", e);

    throw new ApiError(
      "Failed to reverse geocode",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Google Maps API Error"
    );
  }
}
