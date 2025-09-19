import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Switch,
  Select,
  Button,
  Divider,
  Card,
} from "@mantine/core";
import {
  IconBell,
  IconPalette,
  IconShield,
  IconDevices,
} from "@tabler/icons-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  return (
    <Container size="md" py="md">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Settings</Title>
      </Group>

      <Stack gap="lg">
        {/* Notification Settings */}
        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Group mb="md">
            <IconBell size={20} />
            <Title order={3}>Notifications</Title>
          </Group>
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>Push Notifications</Text>
                <Text size="sm" c="dimmed">
                  Receive notifications about important updates
                </Text>
              </div>
              <Switch
                checked={notifications}
                onChange={(event) =>
                  setNotifications(event.currentTarget.checked)
                }
              />
            </Group>
            <Group justify="space-between">
              <div>
                <Text fw={500}>Email Updates</Text>
                <Text size="sm" c="dimmed">
                  Get weekly summaries and important announcements
                </Text>
              </div>
              <Switch
                checked={emailUpdates}
                onChange={(event) =>
                  setEmailUpdates(event.currentTarget.checked)
                }
              />
            </Group>
          </Stack>
        </Paper>

        {/* Appearance Settings */}
        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Group mb="md">
            <IconPalette size={20} />
            <Title order={3}>Appearance</Title>
          </Group>
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>Theme</Text>
                <Text size="sm" c="dimmed">
                  Choose your preferred color scheme
                </Text>
              </div>
              <Select
                value={theme}
                onChange={(value) => setTheme(value || "light")}
                data={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "auto", label: "Auto" },
                ]}
                w={120}
              />
            </Group>
            <Group justify="space-between">
              <div>
                <Text fw={500}>Language</Text>
                <Text size="sm" c="dimmed">
                  Select your preferred language
                </Text>
              </div>
              <Select
                value={language}
                onChange={(value) => setLanguage(value || "en")}
                data={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Español" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" },
                ]}
                w={120}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Privacy & Security */}
        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Group mb="md">
            <IconShield size={20} />
            <Title order={3}>Privacy & Security</Title>
          </Group>
          <Stack gap="md">
            <Card withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Two-Factor Authentication</Text>
                  <Text size="sm" c="dimmed">
                    Add an extra layer of security to your account
                  </Text>
                </div>
                <Button variant="light" size="sm">
                  Enable
                </Button>
              </Group>
            </Card>
            <Card withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Data Export</Text>
                  <Text size="sm" c="dimmed">
                    Download a copy of your data
                  </Text>
                </div>
                <Button variant="light" size="sm">
                  Export
                </Button>
              </Group>
            </Card>
            <Card withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Delete Account</Text>
                  <Text size="sm" c="dimmed">
                    Permanently delete your account and data
                  </Text>
                </div>
                <Button variant="light" color="red" size="sm">
                  Delete
                </Button>
              </Group>
            </Card>
          </Stack>
        </Paper>

        {/* Device Management */}
        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Group mb="md">
            <IconDevices size={20} />
            <Title order={3}>Connected Devices</Title>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Manage devices that have access to your account
          </Text>
          <Stack gap="sm">
            <Card withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Current Device</Text>
                  <Text size="sm" c="dimmed">
                    Chrome on macOS • Active now
                  </Text>
                </div>
                <Button variant="subtle" size="sm" disabled>
                  Current
                </Button>
              </Group>
            </Card>
          </Stack>
        </Paper>

        <Divider />

        {/* Save Settings */}
        <Group justify="flex-end">
          <Button variant="subtle">Cancel</Button>
          <Button variant="filled">Save Changes</Button>
        </Group>
      </Stack>
    </Container>
  );
}
