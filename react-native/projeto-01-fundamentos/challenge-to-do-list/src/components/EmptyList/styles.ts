import { StyleSheet } from "react-native";
import { globalColors } from "../../styles/global-theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderTopColor: globalColors["gray-400"],
    borderTopWidth: 1,
    marginTop: 20,
  },
  textWrapper: {
    alignItems: "center",
  },
  firstText: {
    color: globalColors["gray-400"],
    fontSize: 16,
    fontFamily: "Inter-Bold",
    fontWeight: '700',
    lineHeight: 24,
  },
  secondText: {
    color: globalColors["gray-400"],
    fontSize: 16,
    fontFamily: "Inter-Regular",
    fontWeight: '400',
  }
});
