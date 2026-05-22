import { StyleSheet } from "react-native";
import { globalColors } from "../../styles/global-theme";

export const styles = StyleSheet.create({
  formWrapper: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    top: -26,
    left: 16,
  },
  input: {
    backgroundColor: globalColors["gray-500"],
    color: globalColors["gray-100"],
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    borderRadius: 6,
    padding: 16,
    flex: 1,
    marginRight: 4,
    height: 54,
  },
  button: {
    backgroundColor: globalColors["blue-dark"],
    borderRadius: 6,
    height: 54,
    width: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    marginTop: 6,
  },
});
