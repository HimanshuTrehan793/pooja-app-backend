import { z } from "zod";

export const getMapSearchResultsSchema = z.object({
  q: z.string().min(1, "Search query must be at least 1 character long"),
});

export type MapSearchResultsQueryParams = z.infer<
  typeof getMapSearchResultsSchema
>;

export const getLocationFromCoordinatesSchema = z.object({
  lat: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
  ),
  lng: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
  ),
});

export type LocationFromCoordinatesQueryParams = z.infer<
  typeof getLocationFromCoordinatesSchema
>;
