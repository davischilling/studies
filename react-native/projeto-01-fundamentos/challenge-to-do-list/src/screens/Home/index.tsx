import { useEffect, useState } from "react";
import { Alert, FlatList, View, Keyboard } from "react-native";
import { EmptyList } from "../../components/EmptyList";
import { InputForm } from "../../components/InputForm";
import { ToDoItem } from "../../components/ToDoItem";

import { ToDoStatus } from "../../components/ToDoStatus";
import { globalColors } from "../../styles/global-theme";
import { styles } from "./styles";

type Props = {};

export type ToDoItem = {
  id: string;
  isFinished: boolean;
  text: string;
};

export const Home: React.FC<Props> = () => {
  const [toDoItems, setToDoItems] = useState<ToDoItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [finishedTasks, setFinishedTasks] = useState(0);

  const onChangeValue = (text: string) => {
    setNewTask(text);
  };

  const toggleIsFinished = (id: string) => {
    const newToDoItems = toDoItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isFinished: !item.isFinished,
        };
      }
      return item;
    });

    setToDoItems(newToDoItems);
  };

  const addNewTask = (value: string) => {
    const newToDoItem = {
      id: String(new Date().getTime()),
      isFinished: false,
      text: value,
    };

    setToDoItems([...toDoItems, newToDoItem]);
    setNewTask("");
    Keyboard.dismiss();
  };

  const removeTask = (id: string, value: string) => {
    Alert.alert(
      "Remover",
      `Tem certeza que deseja remover a tarefa ${value}?`,
      [
        {
          text: "Sim",
          onPress: () => {
            const newToDoItems = toDoItems.filter((item) => item.id !== id);
            setToDoItems(newToDoItems);
            Alert.alert("Removido", `Tarefa removida com sucesso.`);
          },
        },
        {
          text: "Não",
          style: "cancel",
        },
      ]
    );
  };

  const countFinishedTasks = () => {
    const finishedTasks = toDoItems.filter((item) => item.isFinished);

    return finishedTasks.length;
  };

  useEffect(() => {
    const finishedTasks = countFinishedTasks();
    setFinishedTasks(finishedTasks);
  }, [toDoItems]);

  return (
    <View style={styles.wrapper}>
      <InputForm
        addNewTask={addNewTask}
        onChangeValue={onChangeValue}
        value={newTask}
      />
      <View style={styles.statusWrapper}>
        <ToDoStatus
          status={"Criadas"}
          statusText={toDoItems.length}
          statusStyle={{ color: globalColors.blue }}
        />
        <ToDoStatus
          status={"Concluídas"}
          statusText={finishedTasks}
          statusStyle={{ color: globalColors.purple }}
        />
      </View>
      <FlatList
        style={styles.toDoList}
        data={toDoItems}
        keyExtractor={({ id }) => id}
        renderItem={({ item: { id, text, isFinished } }) => (
          <ToDoItem
            key={id}
            id={id}
            isFinished={isFinished}
            text={text}
            toggleIsFinished={toggleIsFinished}
            removeTask={removeTask}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => <EmptyList />}
      />
    </View>
  );
};
