/*
// 基础信息
// --------------------------------------------------
*/

// 依赖框架
import React, { Component } from 'react'

// 公用组件
import { Header, Footer } from 'components'

// am 组件
import { List, Button, Modal, InputItem, Icon, Flex, Toast } from 'antd-mobile';
const Item = List.Item;
const prompt = Modal.prompt;

import { Link } from 'react-router';

import { createForm } from 'rc-form'

import store from 'store';

import axios from 'axios'

import { ruleType, tools } from 'helpers';

// 创建并输出页面组件
class BaseInfo extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
    };

    constructor( props ) {
        super( props );

        this.state = {
            data: {
                infoName: '',
                infoHiddenPhone: '',
                infoUserEmail: '',
                infoEnterprise: '',
            },
            modalVisible: false,
        }
    }

    // 显示企业名称编辑弹窗
    showModal(e) {
        // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
        // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            modalVisible: true,
        });
    }

    // 关闭企业名称编辑弹窗
    closeModal() {
        this.setState({
            modalVisible: false,
        });
    }

    // 修改提交的
    handleSubmit() {

        let me = this;

        this.props.form.validateFields(( errors, values ) => {
            if ( errors ) {
                console.log('Errors in form!!!');
                return false;
            }
            console.log( values.editEnterprise,'现在单位名称的值' )

            function getUpdateUserInfoAPI() {
                return axios.get( '/api/user/updateUserInfo?enterprise='+values.editEnterprise );
            }

            axios.all(
                    [
                        getUpdateUserInfoAPI(),
                    ]
                )
                .then(
                    axios.spread(
                        //将 getDaliyStatistics() 定义为 daliystatistics， 将 getAssistConfig() 定义为 assistconfig
                        function( getUpdateUserInfoAPI ) {
                            let data = getUpdateUserInfoAPI.data.data;
                            let code = getUpdateUserInfoAPI.data.code;
                            if( code == 200 ){
                                me.setState({
                                    data
                                });
                                console.log( data,'code==200得到的data' );
                                Toast.success( '单位名称已保存' );
                            } else {
                                Toast.fail( '保存失败，内部错误' );
                            }
                        }
                    )
                );
            me.setState({
                modalVisible: false,
            });
        });
    }

    // 设置基础信息页面的数据
    setRes() {

        let me = this;

        function infoAPI() {
            return axios.get( '/api/user/info' );
        }

        axios.all(
            [
                infoAPI(),
            ],
        )
        .then(
            axios.spread(
                function( infoAPI ) {
                    me.setState({
                        data: {
                            infoName: infoAPI.data.data.name,
                            infoHiddenPhone: infoAPI.data.data.hiddenPhone,
                            infoUserEmail: infoAPI.data.data.userEmail,
                            infoEnterprise: infoAPI.data.data.name,
                        },
                    });
                }
            )
        );
    }

    componentDidMount() {
        this.setRes();
    }

    render() {

        let me = this;

        let data = me.state.data;

        const title = '基础信息'; // 导航文案

        // 表单属性
        const { getFieldProps, getFieldValue, getFieldError, } = me.props.form;

        // fieldProps
        const fieldProps = {
            editEnterprise: {
                validateTrigger: 'onBlur',
                rules: [
                    {
                        required: true,
                        message: '请输入公司名称'
                    },
                    {
                        pattern: /^[a-zA-Z0-9\(\)\u4e00-\u9fa5]+$/,
                        message: '只能包含：2-50个字，中文字符、英文字母（区分大小写）、半角标点符号()'
                    },
                    {
                        min: 2,
                        max: 50,
                        message: '长度必须为2-50个字符'
                    },
                ],
                initialValue: data.infoEnterprise,
            },
        };

        return (
            <div className="container-inner">
                {/* nav */}
                <Header
                    title={ title }
                    inUser={ true }
                    linkTo="UserCenter"
                />
                <div id="gylypt-user-center" className="base-info">
                    <List>
                        <Item
                            extra={ data.infoName }
                            className="list-item-in-1"
                        >
                            真实姓名
                        </Item>
                        <Item
                            extra={ data.infoHiddenPhone }
                            className="list-item-in-2"
                        >
                            手机号码
                        </Item>
                        <Item
                            extra={ data.infoUserEmail }
                            className="list-item-in-3"
                        >
                            电子邮件
                        </Item>
                        <Item
                            arrow={
                                "horizontal"
                            }
                            extra={ data.infoEnterprise }
                            className="list-item-in-4"
                            // onClick={ () => prompt(
                            //     '编辑单位名称',
                            //     <span className="fontcolor-vice">推荐人所在单位名称</span>,
                            //     [
                            //         { text: '取消' },
                            //         //{ text: '提交', onPress: value => console.log(`输入的内容:${ value }`) },
                            //         { text: '提交', onPress: value => console.log(`输入的内容:${ value }`) },
                            //     ],
                            //     'plain-text', '100'
                            // )}
                            onClick={
                                me.showModal.bind( me )
                            }
                        >
                            单位名称
                        </Item>
                        <Modal
                            title="修改单位名称"
                            transparent
                            maskClosable={
                                false
                            }
                            visible={
                                me.state.modalVisible
                            }
                            onClose={
                                me.closeModal.bind( me )
                            }
                            footer={
                                [
                                    {
                                        text: '保存',
                                        // onPress: () => {
                                        //     console.log('ok');
                                        //     this.closeModal();
                                        // }
                                        onPress: me.handleSubmit.bind( me )
                                    }
                                ]
                            }
                        >
                            <form id="gylypt-form-in-modal">
                                <List>
                                    <InputItem
                                        { ...getFieldProps( 'editEnterprise',fieldProps[ 'editEnterprise' ] ) }
                                        clear
                                        error={ !!getFieldError( 'editEnterprise' ) }
                                        onErrorClick={
                                            () => {
                                                Toast.fail( getFieldError('editEnterprise'),2 );
                                            }
                                        }
                                        labelNumber={ 0 }
                                    />
                                </List>
                            </form>
                        </Modal>
                    </List>
                </div>
                {/* 页脚 */}
                <Footer/>
            </div>
        )
    }
}

export default createForm()(BaseInfo);
