import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PublicationScreen from "../PublicationScreen";
import SinglePublicationScreen from "../SinglePublicationScreen";

const Stack = createNativeStackNavigator();

const PublicationsStack = ({ route }) => {
  const { userNick, UserId } = route.params || {};

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="PublicationList"
        component={PublicationScreen}
        initialParams={{ userNick, UserId }}
      />
      <Stack.Screen
        name="SinglePublication"
        component={SinglePublicationScreen}
        initialParams={{ userNick, UserId }}
      />
    </Stack.Navigator>
  );
};

export default PublicationsStack;