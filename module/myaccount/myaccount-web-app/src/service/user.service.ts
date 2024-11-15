import apiService from './api.service';

export default function UserService() {

  async function getUserProfile(accessToken: string) {
    const data = await apiService.get('/me/profile', {
      accessToken,
      cache: 'no-store'
    }, {});
    return data;
  }

  async function updateUserProfile(accessToken: string, payload: any) {
    const data = await apiService.put(
      '/me/profile',
      payload,
      {
        accessToken,
      }
    );
    return data;
  }

  async function getUserStatistics(accessToken: string) {
    const data = await apiService.get('/me/statistics', {
      accessToken,
    });
    return data;
  }

  return { getUserProfile, updateUserProfile, getUserStatistics };
}
