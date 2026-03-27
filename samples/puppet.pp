package { 'nginx':
  ensure => installed,
}
service { 'nginx':
  ensure => running,
  enable => true,
}
