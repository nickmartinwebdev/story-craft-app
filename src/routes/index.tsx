import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Grid,
  Card,
  Box,
  Center,
} from "@mantine/core";
import {
  IconRocket,
  IconDatabase,
  IconCloud,
  IconServer,
} from "@tabler/icons-react";
import { useAuth } from "../auth/context";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
        py={80}
      >
        <Container size="lg">
          <Center>
            <Stack align="center" gap="xl">
              <Title size={60} fw={900} ta="center">
                Welcome to Story<span style={{ color: "#ffd43b" }}>Craft</span>
              </Title>
              <Text size="xl" ta="center" maw={600}>
                A modern web application built with TanStack Start, TanStack DB,
                and Mantine UI. Experience the power of full-stack TypeScript
                with real-time data and beautiful components.
              </Text>

              {isAuthenticated && user ? (
                <Stack align="center" gap="md">
                  <Text size="lg" fw={500}>
                    Welcome back, {user.firstName}!
                  </Text>
                  <Button
                    component={Link}
                    to="/dashboard"
                    size="lg"
                    variant="white"
                    color="blue"
                  >
                    Go to Dashboard
                  </Button>
                </Stack>
              ) : (
                <Group gap="md">
                  <Button
                    component={Link}
                    to="/signup"
                    size="lg"
                    variant="white"
                    color="blue"
                  >
                    Get Started
                  </Button>
                  <Button
                    component={Link}
                    to="/signin"
                    size="lg"
                    variant="outline"
                    style={{ borderColor: "white", color: "white" }}
                  >
                    Sign In
                  </Button>
                </Group>
              )}
            </Stack>
          </Center>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="lg" py={80}>
        <Stack gap={60}>
          <Stack align="center" gap="md">
            <Title order={2} size={36} ta="center">
              Built with Modern Technology
            </Title>
            <Text size="lg" ta="center" c="dimmed" maw={600}>
              StoryCraft leverages cutting-edge technologies to deliver a fast,
              reliable, and scalable web application experience.
            </Text>
          </Stack>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      backgroundColor: "#e3f2fd",
                      borderRadius: "50%",
                      padding: "16px",
                    }}
                  >
                    <IconRocket size={32} color="#1976d2" />
                  </Box>
                  <Title order={3} size="h4" ta="center">
                    TanStack Start
                  </Title>
                  <Text size="sm" ta="center" c="dimmed">
                    Full-stack React framework with SSR, streaming, and server
                    functions for optimal performance.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      backgroundColor: "#e8f5e8",
                      borderRadius: "50%",
                      padding: "16px",
                    }}
                  >
                    <IconDatabase size={32} color="#2e7d2e" />
                  </Box>
                  <Title order={3} size="h4" ta="center">
                    TanStack DB
                  </Title>
                  <Text size="sm" ta="center" c="dimmed">
                    Reactive client store with real-time updates and optimistic
                    mutations for instant UI feedback.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      backgroundColor: "#fff3e0",
                      borderRadius: "50%",
                      padding: "16px",
                    }}
                  >
                    <IconCloud size={32} color="#f57c00" />
                  </Box>
                  <Title order={3} size="h4" ta="center">
                    Cloudflare Pages
                  </Title>
                  <Text size="sm" ta="center" c="dimmed">
                    Lightning-fast global deployment with edge computing for
                    optimal user experience worldwide.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      backgroundColor: "#f3e5f5",
                      borderRadius: "50%",
                      padding: "16px",
                    }}
                  >
                    <IconServer size={32} color="#7b1fa2" />
                  </Box>
                  <Title order={3} size="h4" ta="center">
                    Neon Postgres
                  </Title>
                  <Text size="sm" ta="center" c="dimmed">
                    Serverless PostgreSQL database with automatic scaling and
                    branching for modern development.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      {/* Call to Action */}
      {!isAuthenticated && (
        <Box style={{ backgroundColor: "#f8f9fa" }} py={60}>
          <Container size="lg">
            <Stack align="center" gap="xl">
              <Stack align="center" gap="md">
                <Title order={2} size={36} ta="center">
                  Ready to Get Started?
                </Title>
                <Text size="lg" ta="center" c="dimmed" maw={500}>
                  Join StoryCraft today and experience the future of web
                  development with modern tools and technologies.
                </Text>
              </Stack>
              <Group gap="md">
                <Button component={Link} to="/signup" size="lg">
                  Create Account
                </Button>
                <Button
                  component={Link}
                  to="/signin"
                  size="lg"
                  variant="outline"
                >
                  Sign In
                </Button>
              </Group>
            </Stack>
          </Container>
        </Box>
      )}
    </>
  );
}
