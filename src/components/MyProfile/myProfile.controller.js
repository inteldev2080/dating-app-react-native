import React, { useEffect, useState } from 'react'
import MyProfile from './myProfile'

import Const from '/src/const'
import Api from '/src/api'
import Utils from '/src/utils'
import { useSelector } from 'react-redux'

let token
let indexPhoto
let idUser
let bioBegin
let nameBegin
export default function MyProfileController(props) {
    const { navigation, route } = props
    const [dataProfile, setDataProfile] = useState(null)
    const [dataPhotos, setDataPhotos] = useState(null)
    const refSlideModal = React.createRef()
    const [indexLoading, setIndexLoading] = useState()

    const dataStore = useSelector(state => state.login)

    // const drinkingUpdate = route.params === undefined ? 'Error' : route.params.drinking
    // console.log(`drinkingUpdate: ${drinkingUpdate}`);
    const getDataStore = () => {
        if (dataStore.length > 0) {
            const { jwtToken, id } = dataStore[0]
            token = jwtToken
            idUser = id
        }
        else {
            return null // empty data
        }
    }

    const checkAndFillPhotos = (data, count) => {
        if (data.length < count) {
            const numFill = count - data.length
            for (let i = 1; i < numFill + 1; i++) {
                data.push({ id: i * 999, url: undefined })
            }
        }
        return data
    }


    useEffect(() => {
        getDataStore()
        const params = {
            id: idUser,
            token: token
        }
        async function getApiProfile() {
            return Api.RequestApi.getProfileApiRequest(params)
        }
        getApiProfile().then(res => {
            bioBegin = res.data.bio
            nameBegin = res.data.name
            const photos = res.data.photos
            const dataPhotos = checkAndFillPhotos(photos, 9)
            setDataPhotos(dataPhotos)
            setDataProfile(res.data)
        })
            .catch(err => console.log(err))
        // .finally(() => setIsLoading(false))
    }, [])

    const onPressBack = () => {
        navigation.goBack()
    }

    const onPressInterest = () => {
        navigation.navigate(Const.NameScreens.InterestInfomation)
    }

    const onPressGender = () => {
        navigation.navigate(Const.NameScreens.EditGender)
    }

    const onPressReligious = () => {
        navigation.navigate(Const.NameScreens.Religious)
    }

    const onPressEthnicity = () => {
        navigation.navigate(Const.NameScreens.Ethnicity)
    }

    const onPressKids = () => {
        navigation.navigate(Const.NameScreens.EditKids)
    }

    const onPressFamilyPlans = () => {
        navigation.navigate(Const.NameScreens.EditFamilyPlan)
    }

    const onPressSmoking = () => {
        navigation.navigate(Const.NameScreens.EditSmoking)
    }

    const onPressDrinking = () => {
        navigation.navigate(Const.NameScreens.EditDrinking)
    }

    const onPressAddImage = (index) => {
        indexPhoto = index
        refSlideModal.current.open()
    }

    const onTakePhoto = () => {
        refSlideModal.current.close()
        Utils.Images.openCameraCropImage()
            .then(res => handleDataImage(res, indexPhoto))
            .catch(err => console.log(err))
    }

    const onUploadPhoto = () => {
        refSlideModal.current.close()
        Utils.Images.openPickerCropImage()
            .then(res => handleDataImage(res, indexPhoto))
            .catch(err => console.log(err))
    }
    const handleDataImage = (res, index) => {
        setIndexLoading(index)
        // console.log(`url: ${res}`);
        // const data = [...dataPhotos]
        // data[index].url = url
        // setDataPhotos(data)
        savePhotoCloudinary(res, index)

    }

    const savePhotoCloudinary = (res, index) => {
        const { path, mime } = res
        const typeImage = mime.split('/')[1]
        const nameFile = new Date().getTime().toString() + `.${typeImage}`
        const dataImage = { uri: path, name: nameFile, type: mime }
        Api.CloudinaryApi.postImageApiRequest(dataImage)
            .then(res => res.json())
            .then(
                data => {
                    saveDataPhotoApi(data, index)
                }
            ).catch(err => console.log(err))
    }

    const saveDataPhotoApi = (data, index) => {
        const { public_id, url } = data
        const params = {
            url: url,
            publicId: public_id,
            id: idUser,
            token: token
        }
        Api.RequestApi.putPhotosApiRequest(params)
            .then(response => {
                const dataTemp = [...dataPhotos]
                dataTemp[index].url = response.data.url
                setDataPhotos(dataTemp)
                Utils.Toast.ToastModal('success', 'top', 'Success', 'You have saved your photo successfully', 3000)
            }).catch(err => {
                Utils.Toast.ToastModal('fail', 'top', 'Fail', `You have saved your photo fail, error: ${err}`, 3000)
                console.log(err)
            })
            .finally(() => setIndexLoading(null))
    }

    const onBlurTextExpand = (value) => {
        if (bioBegin !== undefined && bioBegin !== value) {
            const params = {
                bio: value,
                id: idUser,
                token: token
            }
            Api.RequestApi.putBioApiRequest(params)
                .then(response => {
                    bioBegin = response.data.bio
                    Utils.Toast.ToastModal('success', 'top', 'Success', 'You have saved your bio successfully', 3000)
                }).catch(err => {
                    Utils.Toast.ToastModal('fail', 'top', 'Fail', `You have saved your bio fail, error: ${err}`, 3000)
                    console.log(err)
                })
        }
    }

    const onBlurTextInput = (value) => {
        if (nameBegin !== undefined && nameBegin !== value) {
            const params = {
                name: value,
                id: idUser,
                token: token
            }
            Api.RequestApi.putNameApiRequest(params)
                .then(response => {
                    nameBegin = response.data.name
                    Utils.Toast.ToastModal('success', 'top', 'Success', 'You have saved your name successfully', 3000)
                }).catch(err => {
                    Utils.Toast.ToastModal('fail', 'top', 'Fail', `You have saved your name fail, error: ${err}`, 3000)
                    console.log(err)
                })
        }
    }

    return (
        <MyProfile
            onPressDrinking={onPressDrinking}
            onPressSmoking={onPressSmoking}
            onPressBack={onPressBack}
            data={dataProfile}
            dataPhotos={dataPhotos}
            onPressInterest={onPressInterest}
            onPressGender={onPressGender}
            onPressReligious={onPressReligious}
            onPressEthnicity={onPressEthnicity}
            onPressKids={onPressKids}
            onPressFamilyPlans={onPressFamilyPlans}
            onPressAddImage={onPressAddImage}
            onUploadPhoto={onUploadPhoto}
            onTakePhoto={onTakePhoto}
            ref={refSlideModal}
            indexLoading={indexLoading}
            onBlurTextExpand={onBlurTextExpand}
            onBlurTextInput={onBlurTextInput}
        />
    )
}

