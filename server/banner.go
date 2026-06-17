package main

import (
	"fmt"
	"net"
	"strings"
)

func PrintBanner(addr, scoresPath, password string) {
	ip := pickLANIP()
	port := addr
	if strings.HasPrefix(port, ":") {
		port = port[1:]
	}
	url := fmt.Sprintf("http://%s:%s", ip, port)

	bar := strings.Repeat("═", 60)
	fmt.Println()
	fmt.Println(bar)
	fmt.Println("  🌧️  洪水预报员 · 教室服务器已启动")
	fmt.Println(bar)
	fmt.Println()
	fmt.Println("  学生用网址（写到黑板上）:")
	fmt.Println("    " + url)
	fmt.Println()
	fmt.Println("  老师后台（本机访问）:")
	fmt.Printf("    http://localhost:%s/admin\n", port)
	fmt.Println("  口令: " + password)
	fmt.Println()
	fmt.Println("  成绩文件: " + scoresPath)
	fmt.Println()
	fmt.Println("  关闭本窗口即停止服务器。")
	fmt.Println(bar)
	fmt.Println()
}

func pickLANIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "127.0.0.1"
	}
	for _, a := range addrs {
		if n, ok := a.(*net.IPNet); ok && !n.IP.IsLoopback() && n.IP.To4() != nil {
			ip := n.IP.String()
			if strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") ||
				strings.HasPrefix(ip, "172.") {
				return ip
			}
		}
	}
	for _, a := range addrs {
		if n, ok := a.(*net.IPNet); ok && !n.IP.IsLoopback() && n.IP.To4() != nil {
			return n.IP.String()
		}
	}
	return "127.0.0.1"
}
