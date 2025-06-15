import ControlPanelCard from "./control-panel-card";
import {
  FaStar,
  FaDatabase,
  FaCloud,
  FaDesktop,
  FaWifi,
  FaBell,
  FaList,
} from "react-icons/fa";

const SettingsControlPanel = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ControlPanelCard
        icon={<FaStar />}
        title="Features"
        description="Explore new and upcoming features"
        dot
        to="/settings/cloud-providers"
      />
      <ControlPanelCard
        icon={<FaDatabase />}
        title="Data Management"
        description="Manage your data and storage"
        to="/settings/data-management"
      />
      <ControlPanelCard
        icon={<FaCloud />}
        title="Cloud Providers"
        description="Configure cloud AI providers and models"
        to="/settings/cloud-providers"
      />
      <ControlPanelCard
        icon={<FaDesktop />}
        title="Local Providers"
        description="Configure local AI providers and models"
        badge="BETA"
        to="/settings/local-providers"
      />
      <ControlPanelCard
        icon={<FaWifi />}
        title="Connection"
        description="Check connection status and settings"
        to="/settings/connection"
      />
      <ControlPanelCard
        icon={<FaBell />}
        title="Notifications"
        description="View and manage your notifications"
        dot
        to="/settings/notifications"
      />
      <ControlPanelCard
        icon={<FaList />}
        title="Event Logs"
        description="View system events and logs"
        to="/settings/event-logs"
      />
    </div>
  );
};

export default SettingsControlPanel;
