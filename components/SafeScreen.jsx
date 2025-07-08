import { View} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


const SafeScreen = ({ children } ) => {
    const insets = useSafeAreaInsets();
  return (
    <View style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      backgroundColor: '#000',
    }}>
      {children}
    </View>
  )
}

export default SafeScreen