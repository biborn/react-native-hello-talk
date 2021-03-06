import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import uuid from "uuid/v4";
import isEqual from "lodash.isequal";
import { getNavigationKey } from "lib";
import { User } from "models/User";
import { createChat } from "store/modules/chat";
import { setBottomTabBarVisibility } from "store/modules/ui";
import { AppState } from "store/modules";
import { Chat } from "models/Chat";
import { BackButton } from "components";
import ChatCreate from "./ChatCreate";
import { colors } from "theme";

const ChatCreateScreen = {
  screen: ChatCreate,
  navigationOptions: ({ navigation }: NavigationScreenProps) => {
    const selected = navigation.getParam("selected", []) as User[];

    interface Props {
      chats: {
        [key: string]: Chat;
      };
      setBottomTabBarVisibility: typeof setBottomTabBarVisibility;
      createChatRequest: typeof createChat.request;
    }

    const OKButton = ({ chats, ...props }: Props) => {
      const newChatId = uuid();

      // check if chat room with same members exists
      const sameChatRoomExists = Object.keys(chats).find(key => {
        const chatMemberNames = chats[key].title.split(", ");
        const selectedNames = selected.map(user => user.name);

        return isEqual(chatMemberNames.sort(), selectedNames.sort());
      });

      return (
        <TouchableOpacity
          onPress={() => {
            if (!sameChatRoomExists) {
              props.createChatRequest({
                chatId: newChatId,
                selected,
                title: selected[0].name,
                image: selected[0].profileImage
              });
            }

            navigation.navigate(getNavigationKey(["chat", "room"]), {
              chatId: sameChatRoomExists || newChatId
            });
            props.setBottomTabBarVisibility(false);
          }}
          disabled={selected.length <= 0}
        >
          <Text
            style={{
              marginRight: 16,
              fontSize: 20,
              fontWeight: "bold",
              color: selected.length <= 0 ? colors.gray : colors.black
            }}
          >
            OK {selected.length > 0 && `(${selected.length})`}
          </Text>
        </TouchableOpacity>
      );
    };

    const mapStateToProps = (state: AppState) => ({
      chats: state.chats.chats
    });

    const ConnectedOKButton = connect(
      mapStateToProps,
      { setBottomTabBarVisibility, createChatRequest: createChat.request }
    )(OKButton);

    const styles = StyleSheet.create({
      titleContainer: {
        flex: 1,
        alignItems: "flex-start"
      },
      title: {
        fontSize: 24,
        fontWeight: "bold"
      }
    });

    return {
      headerLeft: <BackButton path={["chat", "home"]} showTabBar />,
      headerTitle: (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>선택</Text>
        </View>
      ),
      headerRight: <ConnectedOKButton />
    };
  }
};

export default ChatCreateScreen;
