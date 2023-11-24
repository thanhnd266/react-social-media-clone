import React, { useEffect } from 'react';
import FormInput from '../components/InputField';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import jwt_decode from 'jwt-decode';
import { useFormik } from 'formik';
import { Box } from '@mui/material';
import { SignInPageFields, PlaceHolders, Types, Common } from '../shared/enums/enums';
import { useNavigate } from 'react-router-dom';
import { selecLastVisitedURL } from '../shared/selectors/appSelector';
import { minCharacterCount, maxCharacterCount } from '../helper/utils/constants';
import {
  repeatingCharacter,
  atLeastOneCapitalorSmallLetter,
  atLeastOneNumber,
  atLeastOneSpecialCharacter,
} from '../helper/utils/validationFunctions';
import { DecodedGoogleCredentialResponse, LoginResponse } from '../shared/types/login';
import * as Yup from 'yup';
import {
  getAuthenticationAPIDetails,
  setAlertMessage,
  setAuthenticationAPIDetails,
  setGoogleAPIDetails,
} from '../shared/reducers/APIRequestReducer';
import { useAppDispatch, useAppSelector } from '../store';
import { setIsUserLoggedIn } from '../shared/reducers/appReducer';
import { selectIsLoading } from '../shared/selectors/APIRequestSelector';
import { sessionStorageUtil } from '../helper/utils/storageFunctions';
import { generateErrorMessage } from '../helper/utils/commonFunctions';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [loginError] = React.useState('');
  const lastVisitedURL = useAppSelector(selecLastVisitedURL);
  const isLoading = useAppSelector(selectIsLoading);
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required(t('error:error.validation.required')).email(t('error:error.validation.email.invalid')),
    password: Yup.string()
      .required(t('error:error.validation.required'))
      .test(
        SignInPageFields.PASSWORD,
        () => t('error:error.validation.password.repeatingCharacters'),
        (value) => {
          if (value) {
            return !repeatingCharacter(value);
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
        .catch((error: any) => {
          dispatch(setAlertMessage(generateErrorMessage(error.error)));
        });
    },

    isInitialValid: true,
  });

  const isDisabled = isLoading || !formik.dirty || !formik.isValid;

  useEffect(() => {
    sessionStorageUtil.remove(Common.TOKEN);
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      className="w-screen h-screen items-center justify-center bg-gradient-to-tl from-green-700 to-blue-900"
    >
      <form onSubmit={formik.handleSubmit}>
        <Box
          display="flex"
          flexDirection="column"
          justifyItems="center"
          p={10}
          className="shadow-card w-[75vh] h-[75vh] bg-gray-200"
        >
          <h1 className="text-2xl font-bold py-5">{t('pages.login.welcome')}</h1>
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            className="justify-center flex-col py-2.5 w-full"
          >
            <FormInput
              id={SignInPageFields.EMAIL}
              type={SignInPageFields.EMAIL}
              name={SignInPageFields.EMAIL}
              value={formik.values.email}
              placeHolder={PlaceHolders.EMAIL}
              label={t('pages.login.email')}
              helperText={formik.errors.email ? formik.errors.email : ''}
              onChange={formik.handleChange}
            ></FormInput>
          </Box>

          <Box className="flex align-center justify-center flex-col py-2.5 w-full">
            <FormInput
              id={SignInPageFields.PASSWORD}
              type={SignInPageFields.PASSWORD}
              name={SignInPageFields.PASSWORD}
              value={formik.values.password}
              placeHolder={PlaceHolders.PASSWORD}
              label={t('pages.login.password')}
              helperText={formik.errors.password ? formik.errors.password : ''}
              onChange={formik.handleChange}
            ></FormInput>
          </Box>

          <Box className="flex align-start justify-center w-auto">
            {loginError && <p className="text-red-500">{loginError}</p>}

            <button
              className={`group relative h-12 w-auto !overflow-hidden !rounded-lg !bg-white !text-lg shadow !mt-6 !px-6 select-none ${
                isDisabled ? 'opacity-50 !bg-gray' : ''
              }`}
              aria-label={t('button.signIn')}
              type={Types.SUBMIT}
              disabled={isDisabled}
            >
              {!isDisabled ? (
                <div className="absolute inset-0 w-3 bg-blue-500 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
              ) : null}

              <p className={`relative text-black ${!isDisabled ? 'group-hover:text-white' : ''}`}>{t('button.signIn')}</p>
            </button>
          </Box>

          <Box className="flex flex-column items-center m-5">
            <div className="flex-[4] border-gray-400 border h-[2px]"></div>

            <div className="flex[2] mx-5">{t('pages.login.or')}</div>

            <div className="flex-[4] border-gray-400 border h-[2px]"></div>
          </Box>

          <Box className="flex flex-row justify-evenly">
            <GoogleLogin
              onSuccess={(credentialResponse: CredentialResponse) => {
                if (credentialResponse) {
                  const jwtDecodedResponse: DecodedGoogleCredentialResponse = jwt_decode(credentialResponse.credential as string);

                  sessionStorageUtil.set(Common.TOKEN, jwtDecodedResponse.jti);

                  dispatch(setGoogleAPIDetails(jwtDecodedResponse));
                  dispatch(setIsUserLoggedIn(true));

                  navigate(lastVisitedURL);
                }
              }}
            />
          </Box>
        </Box>
      </form>
    </Box>
  );
}
