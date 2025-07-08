import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
export const initializeNotifications = async () => {
      if (Platform.OS === 'web') {
        console.log('Notifications not supported on web');
        return;
      }
    console.log("Initializing notifications...");
    await Notifications.requestPermissionsAsync()
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
        });
}