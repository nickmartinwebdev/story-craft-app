import {
  createFileRoute,
  useNavigate,
  useSearch,
  Link,
} from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Alert,
} from "@mantine/core";
import { IconShieldX, IconArrowLeft, IconHome } from "@tabler/icons-react";

export const Route = createFileRoute("/unauthorized")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || undefined,
    reason: (search.reason as string) || undefined,
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/unauthorized" });

  const getErrorMessage = (reason?: string) => {
    switch (reason) {
      case "insufficient_permissions":
        return "You don't have the required permissions to access this resource.";
      case "role_required":
        return "This resource requires a specific role that you don't have.";
      case "admin_only":
        return "This area is restricted to administrators only.";
      default:
        return "You are not authorized to access this resource.";
    }
  };

  const getErrorTitle = (reason?: string) => {
    switch (reason) {
      case "insufficient_permissions":
        return "Insufficient Permissions";
      case "role_required":
        return "Role Required";
      case "admin_only":
        return "Admin Access Only";
      default:
        return "Access Denied";
    }
  };

  return (
    <Container size="sm" mt={80}>
      <Paper withBorder shadow="md" p={40} radius="md" ta="center">
        <IconShieldX size={64} color="red" style={{ margin: "0 auto 16px" }} />

        <Title order={1} c="red" mb="md">
          {getErrorTitle(search.reason)}
        </Title>

        <Text size="lg" c="dimmed" mb="xl">
          {getErrorMessage(search.reason)}
        </Text>

        {search.reason && (
          <Alert color="red" variant="light" mb="xl">
            <Text size="sm">
              If you believe this is an error, please contact your administrator
              or check that you have the appropriate permissions.
            </Text>
          </Alert>
        )}

        <Stack>
          <Group justify="center" gap="md">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>

            <Button
              leftSection={<IconHome size={16} />}
              component={Link}
              to="/"
            >
              Go Home
            </Button>
          </Group>

          {search.redirect && (
            <Text size="sm" c="dimmed" mt="md">
              After gaining the necessary permissions, you can{" "}
              <Text
                component="span"
                c="blue"
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate({ to: search.redirect })}
              >
                return to your original destination
              </Text>
              .
            </Text>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
