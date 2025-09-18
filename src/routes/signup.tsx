import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Group,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconLock, IconUser } from "@tabler/icons-react";
import { useAuth } from "../auth/context";

export const Route = createFileRoute("/signup")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/dashboard",
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/signup" });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      firstName: (value) =>
        value.trim().length >= 1 ? null : "First name is required",
      lastName: (value) =>
        value.trim().length >= 1 ? null : "Last name is required",
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords did not match" : null,
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: search.redirect });
    return null;
  }

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const success = await signup(
        values.email,
        values.password,
        values.firstName,
        values.lastName,
      );
      if (success) {
        navigate({ to: search.redirect });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Create your account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor size="sm" component={Link} to="/signin">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Group grow>
              <TextInput
                label="First name"
                placeholder="Your first name"
                leftSection={<IconUser size={16} />}
                key={form.key("firstName")}
                {...form.getInputProps("firstName")}
                required
              />
              <TextInput
                label="Last name"
                placeholder="Your last name"
                leftSection={<IconUser size={16} />}
                key={form.key("lastName")}
                {...form.getInputProps("lastName")}
                required
              />
            </Group>

            <TextInput
              label="Email"
              placeholder="your@email.com"
              leftSection={<IconMail size={16} />}
              key={form.key("email")}
              {...form.getInputProps("email")}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              leftSection={<IconLock size={16} />}
              key={form.key("password")}
              {...form.getInputProps("password")}
              required
            />

            <PasswordInput
              label="Confirm password"
              placeholder="Confirm your password"
              leftSection={<IconLock size={16} />}
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
              required
            />

            <Button
              type="submit"
              fullWidth
              mt="xl"
              loading={loading}
              loaderProps={{ type: "dots" }}
            >
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
