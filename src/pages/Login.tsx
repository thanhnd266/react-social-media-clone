import InfoIcon from '@mui/icons-material/Info';
import { Box } from '@mui/material';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useFormik } from 'formik';
import jwt_decode from 'jwt-decode';
import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '@base/store';
import FormInput from '@components/shared/InputField';
import { SignInPageFields, PlaceHolders, Types, Common } from '@helpers/enums/enums';
import {
  getAuthenticationAPIDetails,
  setAlertMessage,
  setAuthenticationAPIDetails,
  setGoogleAPIDetails,
} from '@helpers/reducers/APIRequestReducer';
import { setIsUserLoggedIn } from '@helpers/reducers/appReducer';
import { selectIsLoading } from '@helpers/selectors/APIRequestSelector';
import { selecLastVisitedURL } from '@helpers/selectors/appSelector';
import { APIError } from '@helpers/types/general';
import { DecodedGoogleCredentialResponse, LoginResponse } from '@helpers/types/login';
import { generateErrorMessage } from '@helpers/utils/commonFunctions';
import { minCharacterCount, maxCharacterCount } from '@helpers/utils/constants';
import { sessionStorageUtil } from '@helpers/utils/storageFunctions';
import {
  repeatingCharacter,
  atLeastOneCapitalorSmallLetter,
  atLeastOneNumber,
  atLeastOneSpecialCharacter,
} from '@helpers/utils/validationFunctions';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button, Checkbox, Form, Input } from 'antd';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [loginError] = React.useState('');
  const lastVisitedURL = useAppSelector(selecLastVisitedURL);
  const isLoading = useAppSelector(selectIsLoading);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const res = await axios.post("https://api-dev.dsc.com.vn/a/auth/external/token", {
        "userName": "0966211059",
        "password": "Dsc@2024",
        "scopes": "openid",
        "type": "PASSWORD",
        "domain": "DSC-CUSTOMER"
      });
      if(res?.data?.code === "0") {
        Cookies.set('access_token', res?.data?.data?.access_token);
        Cookies.set('refresh_token', res?.data?.data?.refresh_token);
        dispatch(setIsUserLoggedIn(true));
        navigate("/");
      }
    } catch(err) {
      console.log(err);
    }


  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required(t('error:error.validation.required'))
      .test(
        SignInPageFields.EMAIL,
        () => t('error:error.validation.email.invalid'),
        (value) => {
          if (value) {
            return /(.+)@(.+){2,}\.(.+){2,}/.test(value);
          }

          return false;
        },
      ),
    password: Yup.string()
      .required(t('error:error.validation.required'))
      .test(
        SignInPageFields.PASSWORD,
        () => t('error:error.validation.password.repeatingCharacters'),
        (value) => {
          if (value) {
            return repeatingCharacter(value);
          }

          return false;
        },
      )
      .test(
        SignInPageFields.PASSWORD,
        () => t('error:error.validation.password.smallAndCapitalLetter'),
        (value) => {
          if (value) {
            return atLeastOneCapitalorSmallLetter(value);
          }

          return false;
        },
      )
      .test(
        SignInPageFields.PASSWORD,
        () => t('error:error.validation.password.oneNumber'),
        (value) => {
          if (value) {
            return atLeastOneNumber(value);
          }

          return false;
        },
      )
      .test(
        SignInPageFields.PASSWORD,
        () => t('error:error.validation.password.oneSpecialCharacter'),
        (value) => {
          if (value) {
            return atLeastOneSpecialCharacter(value);
          }

          return false;
        },
      )
      .min(minCharacterCount, t('error:error.validation.password.minCharacter', { minCharacterCount }))
      .max(maxCharacterCount, t('error:error.validation.password.maxCharacter', { maxCharacterCount })),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      dispatch(
        getAuthenticationAPIDetails({
          username: process.env.REACT_APP_MOCK_USERNAME as string,
          password: process.env.REACT_APP_MOCK_PASSWORD as string,
        }),
      )
        .then((response) => {
          const payload = response.payload as LoginResponse;

          if (payload.id) {
            dispatch(setAuthenticationAPIDetails(payload));
            dispatch(setIsUserLoggedIn(true));

            resetForm();
            navigate(lastVisitedURL);
          }
        })
        .catch((error: APIError) => {
          dispatch(setAlertMessage(generateErrorMessage(error.error)));
        });
    },

    validateOnMount: false,
  });

  const isDisabled = isLoading || !formik.dirty || !formik.isValid;

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      className="w-screen h-screen items-center justify-center bg-gradient-to-tl from-green-700 to-blue-900 landscape:h-[55%] landscape:lg:h-[100vh] landscape:md:h-[55%]"
    >
      <div
        className={`${
          isMobile ? 'w-[90vw] h-fit' : 'w-[40vw]'
        } shadow-card p-[4rem] sm:p-[2rem] md:w-[65vw] md:h-[55vh] bg-gray-200 landscape:h-[55%] landscape:lg:h-[75vh] landscape:md:h-[55%]`}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyItems="center"
          className="w-full"
        >
          <h1 className="text-2xl font-bold py-5">{t('pages.login.welcome')}</h1>
          <Form
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Box>
      </div>
    </Box>
  );
}
