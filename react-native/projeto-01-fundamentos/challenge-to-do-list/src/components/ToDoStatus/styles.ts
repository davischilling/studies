import { StyleSheet } from "react-native";
import { globalColors } from "../../styles/global-theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 56,
  },
  status: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  statusTextWrapper: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: globalColors["gray-400"],
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    color: globalColors["gray-200"],
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
