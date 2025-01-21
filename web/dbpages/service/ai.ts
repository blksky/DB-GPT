import { IInviteQrCode, ILoginAndQrCode, IRemainingUse } from '@/dbpages/typings/ai';
import createRequest from './base';

const getRemainingUse = createRequest<void, IRemainingUse>('/api/ai/config/remaininguses', {
  errorLevel: false,
});

const getLoginQrCode = createRequest<{ token?: string }, ILoginAndQrCode>('/api/ai/config/getLoginQrCode');

const getLoginStatus = createRequest<{ token?: string }, ILoginAndQrCode>('/api/ai/config/getLoginStatus', {
  errorLevel: false,
});

const getInviteQrCode = createRequest<void, IInviteQrCode>('/api/ai/config/getInviteQrCode');

export default { getRemainingUse, getLoginQrCode, getLoginStatus, getInviteQrCode };
