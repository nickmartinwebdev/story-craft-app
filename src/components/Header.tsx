import { Link } from "@tanstack/react-router";
import {
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
  Box,
  Container,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconUser,
  IconDashboard,
} from "@tabler/icons-react";
import { useAuth } from "../auth/context";

export default function Header() {
  const { user, isAuthenticated, signout } = useAuth();

  const handleSignOut = () => {
    signout();
  };

  return (
    <Box
      component="header"
      style={{ borderBottom: "1px solid #e9ecef" }}
      py="md"
    >
      <Container size="xl">
        <Group justify="space-between">
          {/* Logo/Brand */}
          <Group>
            <Text
              component={Link}
              to="/"
              fw={700}
              size="xl"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Story<span style={{ color: "#2196f3" }}>Craft</span>
            </Text>
          </Group>

          {/* Navigation Links */}
          <Group visibleFrom="sm">
            <Button component={Link} to="/" variant="subtle" color="gray">
              Home
            </Button>

            <Button
              component={Link}
              to="/proposals"
              variant="subtle"
              color="gray"
            >
              Proposals
            </Button>

            {isAuthenticated && (
              <Button
                component={Link}
                to="/dashboard"
                variant="subtle"
                color="gray"
              >
                Dashboard
              </Button>
            )}
          </Group>

          {/* Auth Section */}
          <Group>
            {isAuthenticated && user ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="xs">
                      <Avatar size="sm" color="blue">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {user.firstName}
                      </Text>
                      <IconChevronDown size={14} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item
                    component={Link}
                    to="/dashboard"
                    leftSection={<IconDashboard size={14} />}
                  >
                    Dashboard
                  </Menu.Item>
                  <Menu.Item leftSection={<IconUser size={14} />}>
                    Profile
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group>
                <Button component={Link} to="/signin" variant="subtle">
                  Sign In
                </Button>
                <Button component={Link} to="/signup" variant="filled">
                  Sign Up
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
