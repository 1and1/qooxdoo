package net.sf.qooxdoo.rpc;

import javax.servlet.http.HttpServletRequest;


/**
 * Class for providing access to the current environment for server classes.
 */
public class Environment {

	/**
     * Creates a new instance of Environment.
     */
    public Environment() {
    }


    /**
     * Returns the RPC servlet that handles the current request.
     *
     * @return      the RPC servlet.
     */
    public RpcServlet getRpcServlet() {
        return (RpcServlet)RpcServlet._currentInstance.get();
    }


    /**
     * Returns the current servlet request.
     *
     * @return      the request.
     */
    public HttpServletRequest getRequest() {
        return (HttpServletRequest)RpcServlet._currentRequest.get();
    }

}
