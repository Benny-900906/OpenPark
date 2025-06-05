import axios from "axios";
// require("config.env");

// const clientId = process.env.TDX_CLIENT_ID!;
// const clientSecret = process.env.TDX_CLIENT_SECRET!;

export const getAccessToken = async (): Promise<string> => {
    const clientId = "benny900906-5bdad2d3-0ccc-44c0";
    const clientSecret= "972c014f-8506-4db7-af93-3789c77443ad";
    const url = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  
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
