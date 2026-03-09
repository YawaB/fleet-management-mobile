import { TaskDetailScreen } from "./components";

const DetailMain = ({ navigation, route }) => {
  const panne = route?.params?.task;
  return <TaskDetailScreen navigation={navigation} panne={panne} />;
};

export default DetailMain;
