import { StyleSheet } from "react-native";
import { globalColors } from "../../styles/global-theme";

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: globalColors["gray-600"],
    paddingHorizontal: 16,
  },
  statusWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  toDoList: {

  }
});
