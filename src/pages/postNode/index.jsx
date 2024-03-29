import { Button, Textarea, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro'; // 导入 useRouter
import React, { useState } from 'react';
import { AtFloatLayout, AtImagePicker } from 'taro-ui';
import { api } from '../../api';
import { getStorageSync } from '../../base/global.js';
import { saveUserInfo, wechatLogin } from '../../common/user';
import { compressInputImage } from '../../utils/imageTools';
import LoginView from '../comps/LoginView';
import CustomNavBar from '../index/CustomNavBar.jsx';

export default () => {
  const router = useRouter();
  // 从 URL 查询参数中获取参数值
  const tagName = router.params.tagName;
  const [selectedImages, setSelectedImages] = useState([]);
  const [title, setTitle] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [userInfo, setUserInfo] = useState({
    isLogin: false,
    data: {
      points: 0,
      userId: '',
      isChecked: false,
      avatarUrl: '',
    },
  });

  const handlePublish = async () => {
    try {
      if (selectedImages.length === 0) {
        Taro.showToast({
          title: '请选择发布模板',
          icon: 'none',
          duration: 2000,
        });
        return;
      }
      // if (title === '') {
      //   Taro.showToast({
      //     title: '请输入模板标题',
      //     icon: 'none',
      //     duration: 2000,
      //   });
      //   return;
      // }
      const storageUserInfo = getStorageSync('userInfo');
      if (storageUserInfo && storageUserInfo.isLogin) {
        const compressBase64Array = selectedImages.map(
          (image) => image.compressBase64
        );

        await api.uploadImages({
          userId: storageUserInfo.data.userId,
          tagName: tagName,
          momentPics: compressBase64Array,
          momentTitle: title,
        });
        Taro.showToast({
          title: '发布成功',
          icon: 'none',
          duration: 2000,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // if (Taro.getCurrentPages().length > 1) {
        //   Taro.navigateBack();
        // }
      } else {
        // Taro.switchTab({
        //   url: '/pages/user/index',
        // });
        setIsOpened(true);
      }
    } catch (error) {
      console.error('发布失败:', error);
    }
  };

  return (
    <View>
      {/* <CustomNavBar></CustomNavBar> */}
      {/* <View
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100vw', // 设置视口宽度的百分比
          margin: '10px',
        }}
      >
        {selectedImages.map((image, index) => (
          <Image
            key={index}
            src={image}
            mode="aspectFill"
            style={{ width: '30vw', height: '30vw', margin: '5px' }}
          />
        ))}
      </View> */}

      <View style={{ paddingTop: '80px' }}>
        <AtImagePicker
          files={selectedImages.map((image, index) => ({
            ...image,
            url: image.url,
          }))}
          onChange={async (files, operationType, index) => {
            const newImages = files.slice(selectedImages.length);

            // 判断是否为添加图片操作
            if (operationType === 'add') {
              try {
                // 计算当前已选择的图片数量
                const totalImages = selectedImages.length + newImages.length;

                // 设置允许的最大图片数量
                const maxImages = 9;
                if (totalImages <= maxImages) {
                  // 压缩输入的图片
                  for (let i = 0; i < newImages.length; i++) {
                    const compressedFile = await compressInputImage(
                      newImages[i]
                    );
                    // 压缩成功后添加base64数据
                    newImages[i].compressBase64 = compressedFile.base64
                      ? compressedFile.base64
                      : null;
                  }
                  setSelectedImages((prevImages) => [
                    ...prevImages,
                    ...newImages,
                  ]);
                } else {
                  Taro.showToast({
                    title: '最多选择9张图~',
                    icon: 'none',
                    duration: 2000,
                  });
                }
              } catch (error) {
                console.error('处理图片失败：', error);
              }
            } else if (operationType === 'remove') {
              // 使用 index 参数确定被移除的图片
              const removedIndex = index;
              setSelectedImages((prevImages) => {
                const newImages = [...prevImages];
                newImages.splice(removedIndex, 1);
                return newImages;
              });
            }
          }}
          count={1}
          mode="aspectFill"
          length={1}
          showAddBtn={selectedImages.length < 1}
        />
      </View>
      <View
        style={{
          border: '3px solid #e4dddd',
          // background: '#e6e2e2',
          margin: '20px',
        }}
      >
        <Textarea
          placeholder="请输入标题"
          value={title}
          style={{
            // fontWeight: 'bold',
            fontSize: '18px',
            wordBreak: 'break-all',
            flexWrap: 'wrap',
            width: '100%',
          }}
          maxlength={100}
          onInput={(e) => setTitle(e.detail.value)}
        />
      </View>
      <View>
        <Button
          onClick={handlePublish}
          style={{
            border: '10px solid #f5f5f5', // 添加边框
            background: '#82b0e8', // 添加背景色
            borderRadius: '8px', // 添加圆角
            width: '130px',
          }}
        >
          发布
        </Button>
      </View>
      <AtFloatLayout
        isOpened={isOpened}
        onClose={() => {
          setIsOpened(false);
        }}
      >
        <LoginView
          onConfirmLogin={async (res) => {
            setUserInfo({
              isLogin: true,
              data: res.data,
            });
            saveUserInfo({
              isLogin: true,
              data: res.data,
            });
            setIsOpened(false);
          }}
        />
      </AtFloatLayout>
    </View>
  );
};
