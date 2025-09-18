import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Card,
  Badge,
  Avatar,
  Grid,
} from "@mantine/core";
import {
  IconLogout,
  IconUser,
  IconMail,
  IconCalendar,
} from "@tabler/icons-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { auth } = Route.useRouteContext();
  const { user, signout } = auth;

  // User is guaranteed to exist due to the beforeLoad guard
  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signout();
    navigate({ to: "/" });
  };

  return (
    <Container size="md" mt={40}>
      <Group justify="space-between" mb="xl">
        <Title order={1}>Dashboard</Title>
        <Button
          variant="light"
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder shadow="md" p="lg" radius="md">
            <Title order={2} mb="md">
              Welcome back, {user.firstName}!
            </Title>
            <Text c="dimmed" mb="xl">
              This is your personal dashboard. Here you can manage your account
              and access all features.
            </Text>

            <Stack>
              <Card withBorder radius="md" p="md">
                <Group>
                  <Avatar size="lg" color="blue">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar>
                  <div>
                    <Text fw={500} size="lg">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Group gap="xs" mt={3}>
                      <IconMail size={16} />
                      <Text size="sm" c="dimmed">
                        {user.email}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Card>

              <Card withBorder radius="md" p="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Account Status</Text>
                    <Group gap="xs" mt={5}>
                      <Badge
                        color={user.isActive ? "green" : "red"}
                        variant="light"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Group>
                  </div>
                  <IconUser size={24} />
                </Group>
              </Card>

              <Card withBorder radius="md" p="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Member Since</Text>
                    <Group gap="xs" mt={5}>
                      <IconCalendar size={16} />
                      <Text size="sm" c="dimmed">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Card>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Paper withBorder shadow="md" p="lg" radius="md">
              <Title order={3} mb="md">
                Quick Actions
              </Title>
              <Stack>
                <Button variant="light" fullWidth>
                  Update Profile
                </Button>
                <Button variant="light" fullWidth>
                  Change Password
                </Button>
                <Button variant="light" fullWidth>
                  Account Settings
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder shadow="md" p="lg" radius="md">
              <Title order={3} mb="md">
                Recent Activity
              </Title>
              <Text size="sm" c="dimmed">
                No recent activity to show.
              </Text>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
