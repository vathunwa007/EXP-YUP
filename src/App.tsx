import reactLogo from "./assets/react.svg";
import "./App.css";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Box, Button, Slider, TextField, Typography } from "@mui/material";
import * as yup from "yup";
import * as zod from "zod";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { Done } from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";

type Cache = {
  [key: string]: boolean;
};

function App() {
  const refCache = useRef<Cache>({});

  async function getNamePokemon(name: string) {
    console.log("refCache.current", refCache.current[name]);
    if (refCache?.current[name] !== undefined) return refCache?.current[name];
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${name}`
      );
      refCache.current[name] = true;
      return true;
    } catch (error) {
      refCache.current[name] = false;
      return false;
    }
  }

  const registerSchemaYup = yup.object().shape({
    username: yup.string().required("กรุณาระบุ"),
    password: yup.string().required("กรุณาระบุ"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "รหัสผ่านไม่ตรงกัน")
      .required("กรุณาระบุ"),
    age: yup.number().min(20).max(60).required("กรุณาระบุ"),
    pokemonFavorite: yup
      .string()
      .required("กรุณาระบุ")
      .test("valid", "namepokemonCheck", async (value) => {
        if (!value) return false;
        return await getNamePokemon(value);
      }),
  });

  type RegisterTypeYup = yup.InferType<typeof registerSchemaYup>;

  const registerSchemaZod = zod
    .object({
      username: zod.string({ message: "กรุณาระบุ" }).min(1, "กรุณาระบุ"),
      password: zod
        .string({
          message: "กรุณาระบุ",
        })
        .min(1, "กรุณาระบุ"),
      confirmPassword: zod
        .string({
          message: "กรุณาระบุ",
        })
        .min(1, "กรุณาระบุ"),
      age: zod
        .number({ required_error: "อายุต้องมากกว่า 20 แต่ไม่เกิน 60 ปี" })
        .min(20, "อายุต้องมากกว่า 20 ปี")
        .max(60, "อายุต้องน้อยกว่า 60 ปี"),
      pokemonFavorite: zod
        .string()
        .nonempty("กรุณาระบุ")
        .superRefine(async (value) => await getNamePokemon(value || "")),
    })
    .partial()
    .refine((partialInput) => {
      console.log("partialInput", partialInput);
    });

  type RegisterTypeZod = zod.infer<typeof registerSchemaZod>;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterTypeYup>({
    resolver: yupResolver(registerSchemaYup),
    // resolver: zodResolver(registerSchemaZod),
  });

  function valuetext(value: number) {
    return `${value} age`;
  }

  const submitForm = (data: RegisterTypeZod) => {
    console.log("data", data);
  };

  const errorSubmit = (error: FieldErrors<RegisterTypeZod>) => {
    console.log("error", error);
  };

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Yup Validate Rigister</h1>
      <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
        <TextField
          label="username"
          {...register("username")}
          error={Boolean(errors.username)}
        />
        <TextField
          label="password"
          {...register("password")}
          error={Boolean(errors.password)}
        />
        <TextField
          label="confirmPassword"
          {...register("confirmPassword")}
          error={Boolean(errors.confirmPassword)}
        />
        <Controller
          control={control}
          name="age"
          render={({ field, fieldState }) => (
            <>
              <Typography>Age</Typography>
              {fieldState.error && (
                <Typography variant="caption" color="error">
                  {fieldState.error.message}
                </Typography>
              )}
              <Slider
                color={fieldState.error ? "error" : "primary"}
                {...field}
                step={1}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
              />
            </>
          )}
        />
        <TextField
          label="pokemonFavorite"
          {...register("pokemonFavorite")}
          error={Boolean(errors.pokemonFavorite)}
          slotProps={{
            input: {
              endAdornment: !errors.pokemonFavorite && <Done color="success" />,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit(submitForm, errorSubmit)}
        >
          Register
        </Button>
      </Box>
    </>
  );
}

export default App;
