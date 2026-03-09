import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import { getCurrentUser } from '../../Authentication/slice/auth.slice'
import { Menu, Avatar, Divider, Surface } from 'react-native-paper'
import { useDispatch } from 'react-redux'
import { logout } from '../../Authentication/slice/auth.slice'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'

const FeatureHeader = ({ title = 'FLEET EYE' }) => {
  const current_user = useSelector(getCurrentUser);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const _logOut = () => {
    dispatch(logout()).then(() => {
      navigation.navigate("Login");
    });
  };

  const navigateTo = (app) => {
    navigation.navigate(app);
    closeMenu();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Surface style={styles.header} elevation={2}>
      <View style={styles.container}>
        {/* Left: Profile Picture and Name */}
        <View style={styles.leftSection}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu} style={styles.profileButton}>
                {current_user?.photoURL ? (
                  <Avatar.Image size={40} source={{ uri: current_user.photoURL }} />
                ) : (
                  <Avatar.Text 
                    size={40} 
                    label={getInitials(current_user?.fName + ' ' + current_user?.lName)}
                    backgroundColor="#ff9500"
                  />
                )}
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              leadingIcon="account"
              onPress={closeMenu} 
              title="Profile" 
            />
            <Menu.Item 
              leadingIcon="cog"
              onPress={closeMenu} 
              title="Paramètres" 
            />
            <Menu.Item
              leadingIcon="apps"
              onPress={() => navigateTo("Features")}
              title="Applications"
            />
            <Menu.Item 
              leadingIcon="translate"
              onPress={closeMenu} 
              title="Langue" 
            />
            <Divider />
            <Menu.Item 
              leadingIcon="logout"
              onPress={_logOut} 
              title="Déconnexion"
              titleStyle={{ color: '#ff4444' }}
            />
          </Menu>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {current_user?.fName + " " + current_user?.lName}
            </Text>
            <Text style={styles.userRole}>Driver</Text>
          </View>
        </View>

        {/* <Text style={styles.title}>{title}</Text> */}

        {/* Right: Notifications */}
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginRight: 12,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default FeatureHeader;