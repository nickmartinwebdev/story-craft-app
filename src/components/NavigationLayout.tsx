import React from "react";
import {
  AppShell,
  NavLink,
  Group,
  Text,
  Box,
  Burger,
  ScrollArea,
  Menu,
  Avatar,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconMessageCircle,
  IconUser,
  IconSettings,
  IconChevronDown,
  IconLogout,
} from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth/context";

interface NavigationLayoutProps {
  children: React.ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signout } = useAuth();

  const navItems = [
    {
      icon: IconDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: IconMessageCircle,
      label: "Proposals",
      href: "/proposals",
    },
    {
      icon: IconUser,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: IconSettings,
      label: "Settings",
      href: "/settings",
    },
  ];

  const handleSignOut = () => {
    signout();
    navigate({ to: "/" });
  };

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header style={{ borderBottom: "1px solid #e9ecef" }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="#2196f3"
            />
            <Text fw={700} size="xl" style={{ letterSpacing: "-0.5px" }}>
              Story<span style={{ color: "#2196f3" }}>Craft</span>
            </Text>
          </Group>

          {user && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar size="sm" color="blue">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <Text size="sm" fw={500} visibleFrom="sm">
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
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
            Navigation
          </Text>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              to={item.href}
              label={item.label}
              leftSection={<item.icon size="1rem" stroke={1.5} />}
              active={location.pathname === item.href}
              mb="xs"
              style={{
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                    transform: "translateX(4px)",
                  },
                  "&[data-active]": {
                    backgroundColor: "#e3f2fd",
                    borderLeft: "3px solid #2196f3",
                    fontWeight: 600,
                  },
                },
                label: {
                  fontWeight: location.pathname === item.href ? 600 : 500,
                },
              }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Box
            p="sm"
            style={{
              borderTop: "1px solid #e9ecef",
              marginTop: "auto",
              textAlign: "center",
            }}
          >
            <Text size="xs" c="dimmed" mb={4}>
              StoryCraft App v1.0
            </Text>
            <Text size="xs" c="dimmed" style={{ opacity: 0.7 }} mb={4}>
              Built with ❤️ for better proposals
            </Text>
            <Text
              size="xs"
              c="dimmed"
              style={{ opacity: 0.5, fontSize: "10px" }}
            >
              🧠 Powered by Context7-inspired AI
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
