import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Avatar,
  Badge,
  Grid,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconEdit,
} from "@tabler/icons-react";
import { useAuth } from "../../auth/context";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Container size="md" py="md">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Profile</Title>
        <Button variant="filled" leftSection={<IconEdit size={16} />}>
          Edit Profile
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder shadow="md" p="lg" radius="md">
            <Stack align="center" gap="md">
              <Avatar size="xl" color="blue">
                {user.firstName[0]}
                {user.lastName[0]}
              </Avatar>
              <div style={{ textAlign: "center" }}>
                <Text fw={500} size="lg">
                  {user.firstName} {user.lastName}
                </Text>
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>
                <Badge
                  color={user.isActive ? "green" : "red"}
                  variant="light"
                  mt="xs"
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <Paper withBorder shadow="md" p="lg" radius="md">
              <Title order={3} mb="md">
                Account Information
              </Title>
              <Stack gap="sm">
                <Group>
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" fw={500}>
                      Full Name
                    </Text>
                    <Text size="sm" c="dimmed">
                      {user.firstName} {user.lastName}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <IconMail size={16} />
                  <div>
                    <Text size="sm" fw={500}>
                      Email Address
                    </Text>
                    <Text size="sm" c="dimmed">
                      {user.email}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <IconCalendar size={16} />
                  <div>
                    <Text size="sm" fw={500}>
                      Member Since
                    </Text>
                    <Text size="sm" c="dimmed">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Paper>

            <Paper withBorder shadow="md" p="lg" radius="md">
              <Title order={3} mb="md">
                Account Settings
              </Title>
              <Stack>
                <Button variant="light" fullWidth justify="flex-start">
                  Change Password
                </Button>
                <Button variant="light" fullWidth justify="flex-start">
                  Update Email
                </Button>
                <Button variant="light" fullWidth justify="flex-start">
                  Privacy Settings
                </Button>
                <Button
                  variant="light"
                  color="red"
                  fullWidth
                  justify="flex-start"
                >
                  Delete Account
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
