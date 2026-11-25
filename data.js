// 真实项目放 projects，开发日志放 logs。模板预览单独配置，不计入真实项目统计。
window.LAB_DATA = {
  categories: [
    { name:'嵌入式', description:'固件架构 / 外设驱动 / 系统调试', cover:'./assets/images/circuit.svg', icon:'嵌', accent:'cyan' },
    { name:'电源', description:'电路设计 / 电能转换 / 测试验证', cover:'./assets/images/schematic.svg', icon:'电', accent:'amber' }
  ],
  projects: [],
  logs: [],
  projectTemplates: [
    {
      id:'preview-firmware', title:'嵌入式软件项目：从需求到驱动与系统设计', category:'嵌入式', discipline:'软件',
      cover:'./assets/images/firmware.svg', coverAlt:'固件代码主题示意图', tags:['STM32','固件架构'],
      summary:'使用这个框架梳理项目目标、开发环境、驱动实现和测试结果。所有章节均为填写提示，供后续记录真实项目。',
      sections:[
        {title:'一、需求与指标',text:'先说明项目要解决的问题、使用场景和验收标准。',items:['项目目标：填写要实现的功能与使用场景。','主控与平台：填写实际芯片、开发板和硬件版本。','验收指标：填写功能、时序、资源和稳定性要求。']},
        {title:'二、软件架构',text:'整理模块之间的边界、调用关系和数据流。',image:'./assets/images/system.svg',imageAlt:'系统模块关系示意图',caption:'框架示意图，后续可替换为项目的软件架构图。',children:[
          {title:'2.1 启动与初始化',text:'填写启动流程、时钟配置和初始化顺序。'},
          {title:'2.2 模块与接口',text:'填写驱动层、业务层与接口的设计理由。'},
          {title:'2.3 任务调度',text:'说明采用轮询、中断或 RTOS 的理由，并记录任务优先级与交互。'}]},
        {title:'三、关键实现',text:'记录最值得复用的实现细节，并附实际代码片段。',code:'// 在这里替换为项目关键代码\nvoid app_init(void)\n{\n    // 初始化流程\n}'},
        {title:'四、测试与调试',text:'按测试条件、预期结果、实测结果和结论记录验证过程。',table:{columns:['验证项','测试条件','预期结果','实测结果'],rows:[['基础功能','待填写','待填写','待填写'],['异常处理','待填写','待填写','待填写']]}},
        {title:'五、交付与复盘',items:['源码链接与构建步骤','固件版本、配置文件和测试记录','遗留问题与下一步计划']}
      ]
    },
    {
      id:'preview-buck', title:'电源设计记录：BUCK 方案、采样与闭环控制', category:'电源', discipline:'软硬件',
      cover:'./assets/images/schematic.svg', coverAlt:'电源系统框图示意', tags:['BUCK','采样','控制'],
      summary:'用于组织电源项目的设计记录：先写清需求与指标，再解释硬件方案、控制软件、测试过程与交付资料。本页为待填写模板。',
      sections:[
        {title:'一、需求与指标',text:'所有指标均以真实设计与测试结果为准。先填写需求，不把目标值写成实测值。',items:['输入条件：填写输入范围、供电方式与使用场景。','输出要求：填写电压、电流与负载范围。','动态性能：填写纹波、响应、效率和温升目标。','保护策略：填写过压、过流与异常处理要求。']},
        {title:'二、硬件方案',text:'先给出系统框图，再展开关键电路的设计依据。',image:'./assets/images/schematic.svg',imageAlt:'电源项目结构示意图',caption:'示意素材，后续替换为你的实际原理图或系统框图。',children:[
          {title:'2.1 供电与主控',text:'填写供电结构、主控选型、辅助电源与调试接口。'},
          {title:'2.2 主功率电路',text:'记录拓扑、开关器件、电感电容和驱动器的选型依据。'},
          {title:'2.3 电压与电流采样',text:'填写采样范围、传感器、滤波、ADC 换算和校准方法。'},
          {title:'2.4 控制与保护',text:'分别记录硬件与软件保护路径、触发条件和恢复策略。'}]},
        {title:'三、软件设计',children:[
          {title:'3.1 定时器与 PWM',text:'填写频率、占空比、死区和同步采样时序。'},
          {title:'3.2 ADC 与 DMA',text:'记录通道、触发方式、数据缓冲和滤波方法。'},
          {title:'3.3 闭环控制',text:'记录控制周期、算法、参数来源和限幅策略。'},
          {title:'3.4 保护逻辑',text:'记录异常检测、关断路径和故障状态机。'}]},
        {title:'四、测试与调试',text:'附上带测试条件的波形与数据，区分仿真和实测。',table:{columns:['测试项','测试条件','结果','备注'],rows:[['空载 / 带载','待填写','待测量','待填写'],['动态响应','待填写','待测量','待填写'],['保护动作','待填写','待测量','待填写']]}},
        {title:'五、交付资料',items:['原理图、PCB 与 BOM 版本','源码、固件与使用说明','测试记录、问题清单与后续计划']}
      ]
    },
    {
      id:'preview-adc', title:'采样与通信记录：从信号接入到稳定的数据链路', category:'嵌入式', discipline:'软件',
      cover:'./assets/images/signal.svg', tags:['ADC','UART','DMA'],
      summary:'围绕数据链路记录接口、采样、缓冲与异常恢复。本页为记录模板，不包含实际测试结论。',
      sections:[{title:'一、信号与接口',items:['信号来源与电气范围','采样率、精度与通信速率','接线与电平说明']},{title:'二、采集与传输',children:[{title:'2.1 采样与滤波',text:'记录采样时序、数据换算、滤波与校准。'},{title:'2.2 缓冲与协议',text:'记录 DMA、环形缓冲、帧格式、校验与超时策略。'}]},{title:'三、波形与调试',image:'./assets/images/signal.svg',imageAlt:'信号波形示意图',caption:'后续替换为实际测量的波形截图。',text:'记录采样条件、观测结果与异常定位过程。'},{title:'四、结论与复盘',text:'填写稳定性验证、已知限制与改进方向。'}]
    },
    {
      id:'preview-pcb', title:'硬件设计记录：原理图、PCB 与第一版上电', category:'嵌入式', discipline:'硬件',
      cover:'./assets/images/circuit.svg', tags:['PCB','原理图','上电验证'],
      summary:'按版本组织硬件的设计与验证过程，保留选型和改板的理由。本页为待填写模板。',
      sections:[{title:'一、需求与约束',items:['功能与电气要求','板框、接口与机械约束','成本与生产条件']},{title:'二、设计方案',image:'./assets/images/circuit.svg',imageAlt:'电路板布线示意图',caption:'设计示意素材，不是实际 PCB。',children:[{title:'2.1 原理图',text:'记录电源、时钟、复位、接口与保护措施。'},{title:'2.2 PCB 设计',text:'记录层叠、关键布局、回流路径与设计检查。'}]},{title:'三、打样与焊接',text:'填写生产版本、器件替代、焊接与目检记录。'},{title:'四、上电验证',items:['检查供电与短路风险','记录受控上电条件与实际电流','验证时钟、复位、通信与核心功能']},{title:'五、改板与交付',text:'记录修改原因、版本差异与归档文件。'}]
    },
    {
      id:'preview-dcdc', title:'DC–DC 电源记录：选型计算、布局与测试', category:'电源', discipline:'硬件',
      cover:'./assets/images/chip.svg', tags:['DC–DC','选型','验证'],
      summary:'把设计计算、器件参数和测量数据放在同一条证据链上。本页展示文章框架，实际数据待填写。',
      sections:[{title:'一、设计边界',items:['输入与输出条件','功率、效率与温升目标','体积、成本与干扰约束']},{title:'二、参数与选型',children:[{title:'2.1 拓扑选择',text:'记录方案对比、数据手册与选择理由。'},{title:'2.2 器件计算',text:'记录计算过程、裕量、器件额定值和替代型号。'}]},{title:'三、布局与制造',text:'记录关键回路、散热、测试点和生产版本。'},{title:'四、测试报告',table:{columns:['项目','条件','目标','实测'],rows:[['效率','待填写','待填写','待测量'],['纹波','待填写','待填写','待测量'],['温升','待填写','待填写','待测量']]}},{title:'五、问题与迭代',text:'填写根因、变更和回归测试结果。'}]
    },
    {
      id:'preview-control', title:'控制系统记录：模型、策略与实验验证', category:'电源', discipline:'软硬件',
      cover:'./assets/images/system.svg', tags:['控制系统','PWM','实验'],
      summary:'从系统结构和控制目标出发，逐步展开实现、验证与复盘。本页为通用模板。',
      sections:[{title:'一、系统与目标',text:'写明受控对象、输入输出、工作条件和性能要求。'},{title:'二、系统结构',image:'./assets/images/system.svg',imageAlt:'系统节点示意图',caption:'框架示意，替换为真实系统结构。',children:[{title:'2.1 控制模型',text:'说明模型假设、适用范围与参数来源。'},{title:'2.2 控制策略',text:'记录算法、采样周期、执行时序与异常策略。'}]},{title:'三、实现与调试',text:'填写软件实现、硬件配置和关键调试步骤。'},{title:'四、实验与对比',text:'分别展示预期结果、实验条件、测量数据和误差分析。'},{title:'五、结论与后续',text:'填写已验证的结论、限制和下一步计划。'}]
    }
  ]
};
