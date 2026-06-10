/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RegisterSide from "@/components/login/RegisterSide";

const mockRegister = vi.fn();
const mockApiPost = vi.fn();
const mockApiGet = vi.fn();

vi.mock("@/services/authService", () => ({
  register: (...args: any[]) => mockRegister(...args),
}));

vi.mock("@/services/api", () => ({
  api: {
    post: (...args: any[]) => mockApiPost(...args),
    get: (...args: any[]) => mockApiGet(...args),
  },
}));

vi.mock("@unpic/react", () => ({
  Image: (props: any) => <img {...props} alt={props.alt} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
    button: ({ children }: any) => <button>{children}</button>,
  },
}));

vi.mock("react-phone-number-input", () => ({
  default: ({ value, onChange }: any) => (
    <input
      type="tel"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("RegisterSide", () => {
  let originalLocation: Location;

  beforeEach(() => {
    mockRegister.mockReset();
    mockApiPost.mockClear();
    mockApiGet.mockClear();

    originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renderiza formulário e alterna senha", () => {
    render(<RegisterSide />);

    const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(screen.getByLabelText(/senha/i)).toHaveAttribute("type", "text");
  });

  it("mostra erros obrigatórios", async () => {
    render(<RegisterSide />);

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(await screen.findByText(/nome.*obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/e-mail.*obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/telefone.*obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/senha.*obrigatório/i)).toBeInTheDocument();
  });

  it("valida CPF inválido", async () => {
    render(<RegisterSide />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Usuário Teste" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "teste@email.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/\(34\)/i), {
      target: { value: "+5534999999999" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(await screen.findByText(/cpf inv[aá]lido/i)).toBeInTheDocument();
  });

  it("envia formulário válido", async () => {
    mockRegister.mockResolvedValueOnce({
      message: "Usuário criado",
      user: { id: 1 },
    });

    render(<RegisterSide />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Usuário Teste" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "teste@email.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/\(34\)/i), {
      target: { value: "+5534999999999" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it("exibe erro da API", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Email já cadastrado"));

    render(<RegisterSide />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Bene" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bene@teste.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/\(34\)/i), {
      target: { value: "+5534999999999" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(await screen.findByText(/email já cadastrado/i)).toBeInTheDocument();
  });

  it("mostra loading durante requisição", async () => {
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 200))
    );

    render(<RegisterSide />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Bene" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bene@teste.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/\(34\)/i), {
      target: { value: "+5534999999999" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(
      await screen.findByRole("button", { name: /cadastrando/i })
    ).toBeDisabled();
  });

  it("envia CPF formatado corretamente", async () => {
    mockApiPost.mockResolvedValueOnce({ data: {} });

    render(<RegisterSide />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Bene" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bene@teste.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/\(34\)/i), {
      target: { value: "+5534999999999" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: "12345678901" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalled();
    });
  });

  it("desabilita inputs durante loading", async () => {
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 200))
    );

    render(<RegisterSide />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Bene" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bene@teste.com" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByPlaceholderText(/\(34\)/i), {
      target: { value: "+5534999999999" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(
      await screen.findByRole("button", { name: /cadastrando/i })
    ).toBeDisabled();
  });
});