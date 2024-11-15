import { getSession, useSession } from 'next-auth/react';
import apiService from './api.service';

const AccessService = () => {

  const get = async (accessId: any) => {
    const session = await getSession();
    return await apiService.get(`/access/${accessId}`);
  };

  const account = async (accessId: any) => {
    const session = await getSession();
    return await apiService.get(`/access/${accessId}/connection/account`);
  };

  const disconnect = async (accessId: any) => {
    const session = await getSession();
    return await apiService.get(`/access/${accessId}/connection`, {
      method: 'DELETE',
    });
  };

  const connect = async (accessId: any, selectedPaymentMethod: any) => {
    const session = await getSession();
    return await apiService.post(`/access/${accessId}/connection`, {
      selectedPaymentMethod: JSON.stringify({ selectedPaymentMethod })
    }, {
      accessToken: session?.accessToken
    });
  };

  const approveInvite = async (clientId: string , inviteToken: string) => {
    const session = await getSession();
    return await apiService.post(`/access/invite/connection`, {
      clientId: clientId,
      inviteToken: inviteToken
    }, {
      accessToken: session?.accessToken
    });
  };

  const userConnections = async () => {
    const session = await getSession();
    if (!session?.user) throw new Error('Not authenticated');
    return await apiService.get(`/access/connection/?account=${session.user.uid}`);
  };

  const getLicense = async (accessId: any) => {
    return await apiService.get(`/access/${accessId}/license`);
  };

  return { get, connect, disconnect, userConnections, account, getLicense, approveInvite };
};

export default AccessService;
