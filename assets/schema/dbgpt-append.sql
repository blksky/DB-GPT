use dbgpt;

CREATE TABLE IF NOT EXISTS `dbhub_user` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `user_name` varchar(32) NOT NULL COMMENT '用户名',
    `password` varchar(256) DEFAULT NULL COMMENT '密码',
    `nick_name` varchar(256) DEFAULT NULL COMMENT '昵称',
    `email` varchar(256) DEFAULT NULL COMMENT '邮箱',
    `role_code` varchar(32) DEFAULT NULL COMMENT '角色编码',
    `status` varchar(32) NOT NULL DEFAULT 'VALID' COMMENT '用户状态',
    `create_user_id`  bigint(20) unsigned NOT NULL DEFAULT 1 COMMENT '创建人用户id',
    `modified_user_id` bigint(20) unsigned NOT NULL DEFAULT 1 COMMENT '修改人用户id',
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

# INSERT INTO DBHUB_USER (USER_NAME, PASSWORD, NICK_NAME, EMAIL, ROLE_CODE) VALUES ('dbgpt', 'dbgpt', 'Administrator', null, 'ADMIN');
# create UNIQUE INDEX uk_user_user_name on dbhub_user (user_name);

CREATE TABLE IF NOT EXISTS `dashboard` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
    `gmt_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `name` varchar(128) DEFAULT NULL COMMENT '报表名称',
    `description` varchar(128) DEFAULT NULL COMMENT '报表描述',
    `content` text DEFAULT NULL COMMENT '报表布局信息',
    `deleted` text DEFAULT NULL COMMENT '是否被删除,y表示删除,n表示未删除',
    `user_id` bigint(20) unsigned NOT NULL DEFAULT 1 COMMENT '用户id',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='自定义报表表';

# create INDEX idx_dashboard_user_id on dashboard(user_id) ;

CREATE TABLE IF NOT EXISTS `data_source` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `alias` varchar(128) DEFAULT NULL COMMENT '别名',
    `url` varchar(1024) DEFAULT NULL COMMENT '连接地址',
    `user_name` varchar(128) DEFAULT NULL COMMENT '用户名',
    `password` varchar(256) DEFAULT NULL COMMENT '密码',
    `type` varchar(32) DEFAULT NULL COMMENT '数据库类型',
    `env_type` varchar(32) DEFAULT NULL COMMENT '环境类型',
    `user_id` bigint(20) unsigned NOT NULL DEFAULT 1 COMMENT '用户id',
    `host` varchar(128) NULL COMMENT 'host地址',
    `port` varchar(128) NULL COMMENT '端口',
    `ssh` varchar(1024) NULL COMMENT 'ssh配置信息json',
    `ssl` varchar(1024) NULL COMMENT 'ssl配置信息json',
    `sid` varchar(32) NULL COMMENT 'sid',
    `driver` varchar(128) NULL COMMENT '驱动信息',
    `jdbc` varchar(128) NULL COMMENT 'jdbc版本',
    `extend_info` varchar(4096) NULL COMMENT '自定义扩展字段json',
    `driver_config` varchar(1024) NULL COMMENT 'driver_config配置',
    `environment_id` bigint(20) unsigned NOT NULL DEFAULT 2 COMMENT '环境id',
    `kind` varchar(32) NOT NULL DEFAULT 'PRIVATE' COMMENT '连接类型',
    `service_name` varchar(128) NULL COMMENT '服务名',
    `service_type` varchar(128) NULL COMMENT '服务类型',
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='数据源连接表';

# create INDEX idx_user_id on data_source(user_id) ;

create table if not exists `bi_gold_sql` (
    `id`           INT AUTO_INCREMENT COMMENT '主键',
    `db_id`        VARCHAR(50) NOT NULL COMMENT '数据库名称',
    `schema_name`  VARCHAR(50) NOT NULL COMMENT '数据库schema名称',
    `question`     VARCHAR(255) NOT NULL COMMENT '用户问题',
    `evidence`     VARCHAR(255) COMMENT 'evidence',
    `sql`        TEXT  DEFAULT NULL COMMENT 'sql',
    `difficulty`   VARCHAR(50) NOT NULL COMMENT '难度',
    `src_type`     INT NOT NULL COMMENT '来源：0:系统内置,1:管理系统',
    `created_by`   bigint(20)          DEFAULT NULL COMMENT '创建用户',
    `updated_by`   bigint(20)          DEFAULT NULL COMMENT '更新用户',
    `created_time` datetime            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `is_deleted`   tinyint(1)          NOT NULL DEFAULT '0' COMMENT '是否删除',
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT ='Gold SQL';

# create UNIQUE INDEX bi_gold_sql_unique_idx ON bi_gold_sql(db_id, schema_name, question);

create table if not exists `bi_db_er` (
    `id`           INT AUTO_INCREMENT COMMENT '主键',
    `data_source_id` bigint(20) NOT NULL COMMENT '关联的数据源ID',
    `data_schema_name`  VARCHAR(255) NOT NULL COMMENT '数据源的schema名称',
    `content` TEXT NOT NULL COMMENT 'ER图内容',
    `created_by`   bigint(20)          DEFAULT NULL COMMENT '创建用户',
    `updated_by`   bigint(20)          DEFAULT NULL COMMENT '更新用户',
    `created_time` datetime            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `is_deleted`   tinyint(1)          NOT NULL DEFAULT '0' COMMENT '是否删除',
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT ='数据源的ER图';

# create UNIQUE INDEX bi_db_er_unique_idx ON bi_db_er(data_source_id, data_schema_name);
