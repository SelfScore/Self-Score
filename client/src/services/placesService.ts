import api from "../lib/api";

export interface PlaceSuggestion {
    description: string;
    placeId: string;
}

export interface PlacesAutocompleteResponse {
    success: boolean;
    message: string;
    data?: PlaceSuggestion[];
}

export const placesService = {
    /**
     * Get location autocomplete suggestions from backend proxy
     */
    autocomplete: async (input: string): Promise<PlacesAutocompleteResponse> => {
        try {
            const response = await api.get(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
            return response as unknown as PlacesAutocompleteResponse;
        } catch (error) {
            console.error("Error fetching place suggestions:", error);
            throw error;
        }
    },
};
