import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Badge,
  Group,
  Button,
  Card,
  Code,
  Divider,
} from "@mantine/core";
import {
  IconUser,
  IconShield,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

export const Route = createFileRoute("/_authenticated/test-auth")({
  component: TestAuthPage,
});

function TestAuthPage() {
  const { auth } = Route.useRouteContext();
  const { user, signout, isAuthenticated, isLoading } = auth;

  const authTests = [
    {
      name: "User is authenticated",
      status: isAuthenticated,
      description: "Should be true for this protected route",
    },
    {
      name: "User object exists",
      status: !!user,
      description: "Should contain user information",
    },
    {
      name: "Not loading",
      status: !isLoading,
      description: "Authentication should be resolved",
    },
    {
      name: "Has user UUID",
      status: !!user?.uuid,
      description: "User should have a unique identifier",
    },
    {
      name: "Has user email",
      status: !!user?.email,
      description: "User should have an email address",
    },
    {
      name: "Has first name",
      status: !!user?.firstName,
      description: "User should have a first name",
    },
    {
      name: "Has last name",
      status: !!user?.lastName,
      description: "User should have a last name",
    },
  ];

  return (
    <Container size="md" mt={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Group justify="space-between" mb="xl">
          <Title order={1}>Authentication Test Page</Title>
          <Badge
            color={isAuthenticated ? "green" : "red"}
            variant="filled"
            size="lg"
            leftSection={
              isAuthenticated ? <IconCheck size={16} /> : <IconX size={16} />
            }
          >
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </Group>

        <Text c="dimmed" mb="xl">
          This page is only accessible to authenticated users. If you can see
          this, the authentication guard is working correctly.
        </Text>

        <Stack>
          <Card withBorder>
            <Group mb="md">
              <IconUser size={20} />
              <Title order={3}>User Information</Title>
            </Group>
            <Stack gap="sm">
              <Group>
                <Text fw={500} w={100}>
                  UUID:
                </Text>
                <Code>{user?.uuid || "Not available"}</Code>
              </Group>
              <Group>
                <Text fw={500} w={100}>
                  Email:
                </Text>
                <Code>{user?.email || "Not available"}</Code>
              </Group>
              <Group>
                <Text fw={500} w={100}>
                  Name:
                </Text>
                <Code>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Not available"}
                </Code>
              </Group>
              <Group>
                <Text fw={500} w={100}>
                  Active:
                </Text>
                <Badge color={user?.isActive ? "green" : "red"} variant="light">
                  {user?.isActive ? "Active" : "Inactive"}
                </Badge>
              </Group>
              <Group>
                <Text fw={500} w={100}>
                  Created:
                </Text>
                <Code>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "Not available"}
                </Code>
              </Group>
            </Stack>
          </Card>

          <Card withBorder>
            <Group mb="md">
              <IconShield size={20} />
              <Title order={3}>Authentication Tests</Title>
            </Group>
            <Stack gap="sm">
              {authTests.map((test, index) => (
                <Group key={index} justify="space-between">
                  <div>
                    <Text fw={500}>{test.name}</Text>
                    <Text size="sm" c="dimmed">
                      {test.description}
                    </Text>
                  </div>
                  <Badge
                    color={test.status ? "green" : "red"}
                    variant="light"
                    leftSection={
                      test.status ? <IconCheck size={14} /> : <IconX size={14} />
                    }
                  >
                    {test.status ? "Pass" : "Fail"}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Card>

          <Divider />

          <Group justify="center">
            <Button variant="light" color="red" onClick={signout}>
              Sign Out
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
