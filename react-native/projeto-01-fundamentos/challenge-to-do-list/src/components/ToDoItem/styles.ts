import { StyleSheet } from "react-native";
import { globalColors } from "../../styles/global-theme";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 64,
    backgroundColor: globalColors["gray-500"],
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: globalColors["gray-400"],
    paddingHorizontal: 12,
    paddingRight: 8,
    paddingLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  wrapper: {
    width: 287,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  checkbox: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderRadius: 999,
  },
  checked: {
    borderWidth: 5,
  },
  unchecked: {
    borderWidth: 2,
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    lineHeight: 19.6,
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: globalColors["gray-300"],
  },
  uncheckedText: {
    color: globalColors["gray-100"],
  },
  trashIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    flexGrow: 0,
  },
});
