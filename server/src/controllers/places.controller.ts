import { Request, Response } from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import { ApiResponse } from '../types/api';

const client = new Client({});

export class PlacesController {
    /**
     * Autocomplete location search (proxy for Google Places API)
     * GET /api/places/autocomplete?input=query
     */
    static async autocomplete(req: Request, res: Response): Promise<void> {
        try {
            const { input } = req.query;

            if (!input || typeof input !== 'string') {
                const response: ApiResponse = {
                    success: false,
                    message: 'Search query is required'
                };
                res.status(400).json(response);
                return;
            }

            const apiKey = process.env.GOOGLE_PLACES_API_KEY;

            if (!apiKey) {
                console.error('GOOGLE_PLACES_API_KEY not configured');
                const response: ApiResponse = {
                    success: false,
                    message: 'Places API not configured'
                };
                res.status(500).json(response);
                return;
            }

            // Call Google Places Autocomplete API
            const placesResponse = await client.placeAutocomplete({
                params: {
                    input: input,
                    key: apiKey,
                },
                timeout: 5000, // 5 second timeout
            });

            if (placesResponse.data.status === 'OK' || placesResponse.data.status === 'ZERO_RESULTS') {
                const suggestions = placesResponse.data.predictions.map((prediction) => ({
                    description: prediction.description,
                    placeId: prediction.place_id,
                }));

                const response: ApiResponse = {
                    success: true,
                    message: 'Suggestions retrieved successfully',
                    data: suggestions
                };

                res.status(200).json(response);
            } else {
                console.error('Google Places API error:', placesResponse.data.status);
                const response: ApiResponse = {
                    success: false,
                    message: 'Failed to fetch location suggestions'
                };
                res.status(500).json(response);
            }

        } catch (error: any) {
            console.error('Error in places autocomplete:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Internal Server Error'
            };
            res.status(500).json(response);
        }
    }
}
