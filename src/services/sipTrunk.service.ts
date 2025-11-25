import axios from 'axios';
import { AppError } from '../middleware/error.middleware';

const COMM_API_URL = process.env.COMM_API_URL || 'https://keplerov1-python-production.up.railway.app';

interface SetupSipTrunkRequest {
  label: string;
  phone_number: string;
  twilio_sid: string;
  twilio_auth_token: string;
}

interface SetupSipTrunkResponse {
  status: string;
  message: string;
  twilio_trunk_sid: string;
  livekit_trunk_id: string;
  termination_uri: string;
  credential_list_sid: string;
  ip_acl_sid: string;
  username: string;
  origination_uri: string;
  origination_uri_sid: string;
}

interface CreateLivekitTrunkRequest {
  label: string;
  phone_number: string;
  sip_address: string;
  username?: string;
  password?: string;
}

interface CreateLivekitTrunkResponse {
  status: string;
  message: string;
  livekit_trunk_id: string;
  sip_address: string;
  phone_number: string;
}

export class SipTrunkService {
  /**
   * Setup SIP trunk with Twilio
   * Calls Python /calls/setup-sip-trunk endpoint
   */
  async setupSipTrunk(data: SetupSipTrunkRequest): Promise<SetupSipTrunkResponse> {
    try {
      const pythonUrl = `${COMM_API_URL}/calls/setup-sip-trunk`;
      
      console.log('[SIP Trunk Service] ===== CALLING PYTHON SERVICE =====');
      console.log('[SIP Trunk Service] Python API Base:', COMM_API_URL);
      console.log('[SIP Trunk Service] Full URL:', pythonUrl);
      console.log('[SIP Trunk Service] Method: POST');
      console.log('[SIP Trunk Service] Request payload:', {
        label: data.label,
        phone_number: data.phone_number,
        twilio_sid: data.twilio_sid,
        twilio_auth_token: '***hidden***'
      });
      
      const response = await axios.post<SetupSipTrunkResponse>(
        pythonUrl,
        {
          label: data.label,
          phone_number: data.phone_number,
          twilio_sid: data.twilio_sid,
          twilio_auth_token: data.twilio_auth_token
        },
        {
          timeout: 60000 // 60 seconds timeout
        }
      );

      console.log('[SIP Trunk Service] ✅ Python response received');
      console.log('[SIP Trunk Service] Status:', response.status);
      console.log('[SIP Trunk Service] Full response body:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('[SIP Trunk Service] Response fields breakdown:');
      console.log('  - status:', response.data.status);
      console.log('  - message:', response.data.message);
      console.log('  - livekit_trunk_id:', response.data.livekit_trunk_id);
      console.log('  - twilio_trunk_sid:', response.data.twilio_trunk_sid);
      console.log('  - termination_uri:', response.data.termination_uri);
      console.log('  - origination_uri:', response.data.origination_uri);
      console.log('  - credential_list_sid:', response.data.credential_list_sid);
      console.log('  - ip_acl_sid:', response.data.ip_acl_sid);
      console.log('  - username:', response.data.username);
      console.log('  - origination_uri_sid:', response.data.origination_uri_sid);
      
      return response.data;
    } catch (error: any) {
      console.error('[SIP Trunk] ❌ Failed to setup Twilio SIP trunk:', error.response?.data || error.message);
      throw new AppError(
        error.response?.status || 500,
        'SIP_TRUNK_SETUP_ERROR',
        error.response?.data?.message || error.response?.data?.detail || 'Failed to setup SIP trunk with Twilio'
      );
    }
  }

  /**
   * Create LiveKit SIP trunk
   * Calls Python /calls/create-livekit-trunk endpoint
   */
  async createLivekitTrunk(data: CreateLivekitTrunkRequest): Promise<CreateLivekitTrunkResponse> {
    try {
      console.log('[SIP Trunk] Creating LiveKit SIP trunk...');
      
      const response = await axios.post<CreateLivekitTrunkResponse>(
        `${COMM_API_URL}/calls/create-livekit-trunk`,
        {
          label: data.label,
          phone_number: data.phone_number,
          sip_address: data.sip_address,
          username: data.username || 'username',
          password: data.password || 'password'
        },
        {
          timeout: 60000 // 60 seconds timeout
        }
      );

      console.log('[SIP Trunk] ✅ LiveKit SIP trunk created successfully');
      console.log('[SIP Trunk] LiveKit Trunk ID:', response.data.livekit_trunk_id);
      
      return response.data;
    } catch (error: any) {
      console.error('[SIP Trunk] ❌ Failed to create LiveKit SIP trunk:', error.response?.data || error.message);
      throw new AppError(
        error.response?.status || 500,
        'LIVEKIT_TRUNK_ERROR',
        error.response?.data?.message || error.response?.data?.detail || 'Failed to create LiveKit SIP trunk'
      );
    }
  }
}

export const sipTrunkService = new SipTrunkService();

