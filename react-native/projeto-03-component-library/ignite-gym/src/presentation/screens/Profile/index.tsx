import { Header } from "@/presentation/components/Header";
import { UserPhoto } from "@/presentation/components/UserPhoto";
import { Center, ScrollView, useToast, VStack } from "native-base";
import React, { useState } from "react";
import { ChangePhoto } from "./components/ChangePhoto";
import { PhotoSkeleton } from "./components/PhotoSkeleton";

import { useAuth } from "@/domain/hooks/use_auth";
import {
  ProfileFormData,
  profileSchema,
  ProfileValidationContext,
} from "@/domain/validations/profile";
import { FormValidation } from "@/presentation/contexts/Validation";

import { FormInputs } from "./components/FormInputs";
import { useStatefulUseCase } from "@/domain/hooks/use_stateful_uc";
import {
  ProfileScreenUseCase,
  DEFAULT_STATE,
  State,
} from "@/domain/use_cases/screens/profile";
import { useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@/presentation/navigation/app.routes";
import defaultUserAvatar from "@/presentation/assets/userPhotoDefault.png";
import { getAvatarImage } from "@/domain/utils/get_server_image";

const PHOTO_SIZE = 33;

export const Profile = () => {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const { user, updatedUserProfile } = useAuth();

  const { state, useCase } = useStatefulUseCase<State, ProfileScreenUseCase>({
    UseCase: ProfileScreenUseCase,
    DEFAULT_STATE,
    INITIAL_STATE: {
      toast,
    },
  });

  const handleSubmit = async (data: ProfileFormData) => {
    if (data.name === user.name && !data.old_password) return;
    await useCase?.handleUpdateProfileSubmit(data, async () => {
      await updatedUserProfile({ name: data.name });
      navigation.navigate("Home");
    });
  };

  return (
    <VStack flex={1}>
      <Header title="Perfil" />
      <ScrollView>
        <Center my={6} px={10}>
          {state.isPhotoLoading ? (
            <PhotoSkeleton h={PHOTO_SIZE} w={PHOTO_SIZE} />
          ) : (
            <UserPhoto
              size={PHOTO_SIZE}
              source={
                user.avatar
                  ? {
                      uri: getAvatarImage(user.avatar),
                    }
                  : defaultUserAvatar
              }
              alt="Foto do usuário"
            />
          )}
          <ChangePhoto
            text="Alterar foto"
            onPress={async () =>
              await useCase!.handleSelectImage(async (avatar: string) => {
                await updatedUserProfile({ avatar });
              })
            }
          />
          <FormValidation
            ValidationContext={ProfileValidationContext}
            schema={profileSchema}
            defaultValues={{
              name: user.name,
            }}
          >
            <FormInputs
              onSubmit={handleSubmit}
              isLoading={state.isLoading}
              email={user.email}
            />
          </FormValidation>
        </Center>
      </ScrollView>
    </VStack>
  );
};
