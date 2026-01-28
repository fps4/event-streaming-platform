'use client';

import axios, { endpoints, authClient } from 'src/lib/axios';

import { formatApiError } from '../../utils';
import { setSession, setStoredUser } from './utils';

/** **************************************
 * Sign in
 *************************************** */

// ----------------------------------------------------------------------

export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { username: email, password };

    const res = await authClient.post(endpoints.auth.signIn, params);

    const { token, user } = res.data;

    if (!token) {
      throw new Error('Token not found in response');
    }

    setStoredUser(user || null);
    setSession(token);
  } catch (error) {
    throw new Error(formatApiError(error));
  }
};

/** **************************************
 * Sign up
 *************************************** */

// ----------------------------------------------------------------------

export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    username: email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await authClient.post(endpoints.auth.signUp, params);

    const { token, user, workspace_id: workspaceId } = res.data;

    if (!token) {
      throw new Error('Token not found in response');
    }

    setStoredUser(user ? { ...user, workspaceId } : null);
    setSession(token);
  } catch (error) {
    throw new Error(formatApiError(error));
  }
};

/** **************************************
 * Sign out
 *************************************** */

// ----------------------------------------------------------------------

export const signOut = async () => {
  try {
    setStoredUser(null);
    await setSession(null);
  } catch (error) {
    throw new Error(formatApiError(error));
  }
};
