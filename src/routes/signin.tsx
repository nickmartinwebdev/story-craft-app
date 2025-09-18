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
import { IconMail, IconLock } from "@tabler/icons-react";
import { useAuth } from "../auth/context";

export const Route = createFileRoute("/signin")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/dashboard",
  }),
  component: SignInPage,
});

function SignInPage() {
  const [loading, setLoading] = useState(false);
  const { signin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/signin" });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
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
      const success = await signin(values.email, values.password);
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
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor size="sm" component={Link} to="/signup">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
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

            <Group justify="space-between" mt="lg">
              <Anchor component={Link} to="/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            <Button
              type="submit"
              fullWidth
              mt="xl"
              loading={loading}
              loaderProps={{ type: "dots" }}
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
