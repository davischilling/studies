import { StyleSheet, Platform } from "react-native";
import { globalColors } from "../../styles/global-theme";

export const styles = StyleSheet.create({
    container: {
        backgroundColor: globalColors["gray-700"],
        height: 173,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 24,
    },
    logo: {
        paddingTop: Platform.OS === 'android' ? 44 + 24 : 20 + 24,
        paddingBottom: 40
    },
})