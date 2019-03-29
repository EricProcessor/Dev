import Express = require('express')
var axios = require('axios')
// 课程列表请求java接口
export async function InterfaceQuery(req, res) {
    // axios.get('https://minecraft.education.jdcloud.com/getUserInfo', { 
        
    //接收参数
    let {query, market, languages, fieldsTemplate, catalogId, productType, skip} = req.query


    axios.get('http://127.0.0.1:8080/mee/query')
        .then(function (resData) {
            // res.send(JSON.stringify(res1.data) + '====res1.lessons====')
            const data = resData.data.lessons //请求的lessons数据
            // const data = queryLessons.lessons
            let ProductIds = [];  //数据ID
            let Products = [];  //类表数据
            let attaches // 类表数据-下载相关
            for (var i in data) {
                // ProductIds.push(data[i].id)
                ProductIds[i] = data[i].id;
                attaches = data[i].attaches[0];
                Products[i] = {
                    "LastModifiedDate": data[i].updateTime,
                    "LocalizedProperties": [
                        {
                            "Images": [
                                {
                                    "ImagePurpose": "logo",
                                    "Uri": data[i].thumbnail
                                }
                            ],
                            "Language": "en",
                            "ProductSubtitle": data[i].subtitle,
                            "Contributors": [
                                {
                                    "ContributorId": "1",
                                    "Name": null,
                                    "RoleType": "creator",
                                    "Order": 0
                                }
                            ],
                            "SearchKeywords": [
                                "MustHave"
                            ],
                            "ProductDescription": (data[i].description ? data[i].description : null),
                            "ProductTitle": data[i].title,
                            "Markets": [
                                "US",
                                "NEUTRAL"
                            ]
                        }
                    ],
                    "ProductId": data[i].id,
                    "DisplaySkuAvailabilities": [
                        {
                            "Sku": {
                                "LastModifiedDate": (attaches.updateTime ? attaches.updateTime : null),
                                "MarketProperties": [
                                    {
                                        "FulFillmentServiceData": [
                                            {
                                                "ResourceDownloadUri": attaches.uri,
                                                "ResourceId": attaches.id,
                                                "ResourceType": attaches.type,
                                                "ResourceFormat": "mcworld"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
            // 输出数据
            let backOut = {
                "ProductIds": ProductIds,
                "HasMorePages": false,
                "Products": Products,
                "TotalResultCount": ProductIds.length
            }

            res.send(JSON.stringify(backOut))
        }).catch(function (error) {
            console.log(error);
        });

}
// 商品详情请求java接口
export async function InterfaceHydrate(req, res) {
    var aid = req.params.id;
    axios.get('http://127.0.0.1:8080/mee/hydrate', { params: { lessonId: aid } })
        .then(function (response) {
            let data = response.data.lesson
            let Product;  //详情数据
            let attaches = data.attaches[0]; //详情数据-下载相关
            //详情数据
            Product = {
                "LastModifiedDate": data.updateTime,
                "LocalizedProperties": [
                    {
                        "Images": [
                            {
                                "ImagePurpose": "logo",
                                "Uri": data.thumbnail
                            }
                        ],
                        "Language": "en",
                        "ProductSubtitle": data.subtitle,
                        "Contributors": [
                            {
                                "ContributorId": "1",
                                "Name": null,
                                "RoleType": "creator",
                                "Order": 0
                            }
                        ],
                        "SearchKeywords": [
                            "MustHave"
                        ],
                        "ProductDescription": (data.description ? data.description : null),
                        "ProductTitle": data.title,
                        "Markets": [
                            "US",
                            "NEUTRAL"
                        ]
                    }
                ],
                "ProductId": data.id,
                "DisplaySkuAvailabilities": [
                    {
                        "Sku": {
                            "LastModifiedDate": (attaches.updateTime ? attaches.updateTime : null),
                            "MarketProperties": [
                                {
                                    "FulFillmentServiceData": [
                                        {
                                            "ResourceDownloadUri": attaches.uri,
                                            "ResourceId": attaches.id,
                                            "ResourceType": attaches.type,
                                            "ResourceFormat": "mcworld"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
            //接口传出数据
            let backOut = {
                "Product": Product
            }
            res.send(JSON.stringify(backOut))
        })
        .catch(function (error) {
            console.log(error);
        });
}