const { Ionicons, Feather, FontAwesome } = require("@expo/vector-icons");

export const SCREENS_ICONS = {
    List: {
        icon: {
          name: "list",
        },
        title: "Ajouter",
    },
    ClosedTickets: {
        icon: {
          name: "bar-chart",
        },
        title: "Rapport",
    },
    Add: {
        icon: {
          name: "add-circle",
        },
        title: "Ajouter",
    },
    Tag: {
      icon: {
        name: "pricetags-outline",
      },
      title: "Gestion des tache",
    },
    Dashboard: {
      icon: {
        name: "apps",
      },
      title: "Tableau de board",
    },
    Redirect: {
      icon: {
        name: "Redirect",
        component: <FontAwesome name="drivers-license" />,
      },
    },
    Settings: {
      icon: {
        name: "people-outline",
      },
      title: "Parametres",
    },
    Notifications: {
      icon: {
        name: "notifications-outline",
      },
      title: "Notifications",
    }
};

export const APP_COLORS = {
  primary: '#193451',
  secondary: '#f48307'
}
