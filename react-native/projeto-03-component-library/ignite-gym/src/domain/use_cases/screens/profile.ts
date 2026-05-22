import {
  UpdateProfileProps,
  updateUserNameAndPasswordService,
} from "@/domain/services/auth/update_user_name_and_password";
import { StatefulUseCase } from "@/domain/use_cases/index";
import { errorHandler } from "@/domain/utils/error_handler";
import { ToastProps } from "presentation/@types/toast";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { updateUserAvatarService } from "@/domain/services/auth/update_user_avatar";

export type State = {
  isPhotoLoading: boolean;
  isLoading: boolean;
  toast: ToastProps;
};

export const DEFAULT_STATE: State = {
  isLoading: false,
  isPhotoLoading: false,
  toast: {} as ToastProps,
};

export class ProfileScreenUseCase extends StatefulUseCase<State> {
  public handleUpdateProfileSubmit = async (
    data: UpdateProfileProps,
    cb: () => Promise<void>
  ): Promise<void> => {
    await errorHandler({
      mainCb: async () => {
        this.startLoading();
        await updateUserNameAndPasswordService.handle(data);
        this.state.toast.show({
          title: "Atualização de perfil realizada com sucesso.",
          placement: "top",
          bgColor: "green.700",
        });
        await cb();
        this.stopLoading()
      },
      errorMessage: "Não foi possível atualizar o perfil. Tente novamente.",
      toast: this.state.toast,
    });
  };

  public handleSelectImage = async (cb: (avatar: string) => Promise<void>) => {
    await errorHandler({
      mainCb: async () => {
        this.startIsPhotoLoading();
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          aspect: [4, 4],
        });
        if (result.canceled) return;
        const photoSelected = result.assets[0];
        if (photoSelected.uri) {
          const photoInfo: any = await FileSystem.getInfoAsync(
            photoSelected.uri
          );
          if (photoInfo.size && photoInfo.size / 1024 / 1024 > 0.5) {
            return this.state.toast.show({
              title: "A imagem deve ter no máximo 5MB",
              bgColor: "red.500",
              placement: "top",
              marginTop: 10,
            });
          }
          const fileExtension = photoSelected.uri.split(".").pop();
          const photoFile = {
            name: `${new Date().getTime()}.${fileExtension}`.toLocaleLowerCase(),
            uri: photoSelected.uri,
            type: `${photoSelected.type}/${fileExtension}`
          } as any;
          const uploadPhotoForm = new FormData();
          uploadPhotoForm.append("avatar", photoFile);
          const updatedAvatar = await updateUserAvatarService.handle(uploadPhotoForm);
          await cb(updatedAvatar)
          this.state.toast.show({
            title: "Imagem atualizada!",
            bgColor: "green.700",
            placement: "top",
            top: 10,
          });
        }
      },
      errorMessage: "Erro no upload da imagem. Tente novamente.",
      finallyCb: async () => this.stopIsPhotoLoading(),
      toast: this.state.toast,
    });
  };
  private startLoading = () => {
    this.setState({ isLoading: true });
  };

  private stopLoading = () => {
    this.setState({ isLoading: false });
  };

  private startIsPhotoLoading = () => {
    this.setState({ isPhotoLoading: true });
  };

  private stopIsPhotoLoading = () => {
    this.setState({ isPhotoLoading: false });
  };
}
