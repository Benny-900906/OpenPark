import axios from "axios";

export const getAccessToken = async (): Promise<string> => {
    const clientId : string = process.env.REACT_APP_TDX_CLIENT_ID!;
    const clientSecret : string = process.env.REACT_APP_TDX_CLIENT_SECRET!;
    const url : string = process.env.REACT_APP_TDX_TOKEN_URL!;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
  
    try {
      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }
